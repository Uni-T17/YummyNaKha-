import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import type { User } from "@/lib/generated/prisma/client";
import { prisma } from "../db";
import { getAppUrl, getGoogleOAuth } from "../env";
import { createSession } from "./session";

// "Continue with Google" — OAuth 2.0 authorization code flow with PKCE and a
// state check (OpenID Connect). We keep only Google's account ID, the name and
// the verified email; Google's access / ID tokens are used once and never
// stored (rule.md: store only our own login tokens, never provider credentials).

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const ISSUERS = new Set(["https://accounts.google.com", "accounts.google.com"]);

const isProd = process.env.NODE_ENV === "production";
const FLOW_COOKIE = isProd ? "__Host-yn_google" : "yn_google";
const FLOW_MINUTES = 10;

/** A sign-in that failed for a reason the user should see on the Sign In screen. */
export class GoogleSignInError extends Error {
  constructor(public reason: "cancelled" | "failed" | "unverified") {
    super(reason);
  }
}

const redirectUri = (request: Request) => `${getAppUrl(request)}/api/auth/google/callback`;
const base64url = (bytes: Buffer) => bytes.toString("base64url");

/** Starts the flow: remembers state + PKCE verifier in a short-lived cookie and returns Google's sign-in URL. */
export async function startGoogleSignIn(request: Request): Promise<string> {
  const { clientId } = getGoogleOAuth();
  const state = base64url(randomBytes(32));
  const verifier = base64url(randomBytes(48));
  (await cookies()).set(FLOW_COOKIE, `${state}.${verifier}`, {
    httpOnly: true,
    secure: isProd,
    // Lax: the cookie must come back on Google's top-level redirect to our callback.
    sameSite: "lax",
    path: "/",
    maxAge: FLOW_MINUTES * 60,
  });
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri(request),
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: base64url(createHash("sha256").update(verifier).digest()),
    code_challenge_method: "S256",
    prompt: "select_account",
  });
  return `${AUTH_URL}?${params}`;
}

const tokenResponse = z.object({ id_token: z.string() });
const idTokenClaims = z.object({
  iss: z.string(),
  aud: z.string(),
  exp: z.number(),
  sub: z.string().min(1).max(255),
  email: z.email(),
  email_verified: z.boolean(),
  name: z.string().optional(),
});

function decodeJwtPayload(jwt: string): unknown {
  try {
    return JSON.parse(Buffer.from(jwt.split(".")[1] ?? "", "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/** Finishes the flow: checks state, exchanges the code, then signs the Google account in. */
export async function finishGoogleSignIn(request: Request): Promise<User> {
  const url = new URL(request.url);
  const store = await cookies();
  const flow = store.get(FLOW_COOKIE)?.value;
  store.delete(FLOW_COOKIE);

  if (url.searchParams.get("error")) throw new GoogleSignInError("cancelled");
  const [state, verifier] = flow?.split(".") ?? [];
  const code = url.searchParams.get("code");
  if (!state || !verifier || !code || url.searchParams.get("state") !== state) throw new GoogleSignInError("failed");

  const { clientId, clientSecret } = getGoogleOAuth();
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri(request),
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);
  const tokens = tokenResponse.safeParse(response?.ok ? await response.json().catch(() => null) : null);
  if (!tokens.success) {
    console.error("[google] token exchange failed:", response?.status ?? "network error");
    throw new GoogleSignInError("failed");
  }

  // The ID token came straight from Google's token endpoint over TLS, so its
  // signature need not be re-checked (OpenID Connect Core §3.1.3.7); the
  // issuer, audience and expiry still are.
  const claims = idTokenClaims.safeParse(decodeJwtPayload(tokens.data.id_token));
  if (!claims.success || !ISSUERS.has(claims.data.iss) || claims.data.aud !== clientId || claims.data.exp * 1000 < Date.now()) {
    console.error("[google] unexpected ID token");
    throw new GoogleSignInError("failed");
  }
  if (!claims.data.email_verified) throw new GoogleSignInError("unverified");

  const user = await findOrCreateUser(claims.data);
  await createSession(user.id);
  return user;
}

/**
 * The Google account's YummyNaKha! account: matched by Google ID, else linked
 * to an existing account with the same (Google-verified) email, else created
 * without a password.
 */
async function findOrCreateUser(google: z.infer<typeof idTokenClaims>): Promise<User> {
  const bySub = await prisma.user.findUnique({ where: { googleSub: google.sub } });
  if (bySub) return bySub;

  const email = google.email.toLowerCase();
  const byEmail = await prisma.user.findUnique({ where: { email } });
  if (byEmail) return prisma.user.update({ where: { id: byEmail.id }, data: { googleSub: google.sub } });

  const name = (google.name?.trim() || email.split("@")[0]).slice(0, 60);
  return prisma.user.create({ data: { name, email, googleSub: google.sub } });
}
