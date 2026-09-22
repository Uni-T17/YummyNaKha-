import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "../db";
import { getAuthSecret } from "../env";

// Database-backed sessions. The browser holds a random 256-bit token in an
// httpOnly cookie; the database stores only HMAC-SHA256(AUTH_SECRET, token),
// so a leaked sessions table can't be replayed and a leaked secret alone
// can't forge sessions.

const SESSION_DAYS = 30;
/** Extend the session when less than this much time is left (sliding expiry). */
const RENEW_WITHIN_MS = 15 * 24 * 60 * 60 * 1000;

const isProd = process.env.NODE_ENV === "production";
// __Host- cookies must be Secure, so the prefix is used only over HTTPS (production).
export const SESSION_COOKIE = isProd ? "__Host-yn_session" : "yn_session";

function hashToken(token: string) {
  return createHmac("sha256", getAuthSecret()).update(token).digest("hex");
}

function expiryFromNow() {
  return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
}

async function setCookie(token: string, expires: Date) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = expiryFromNow();
  await prisma.session.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });
  await setCookie(token, expiresAt);
}

/** Returns the valid session for the request cookie, or null. */
export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  if (session.expiresAt.getTime() - Date.now() < RENEW_WITHIN_MS) {
    const expiresAt = expiryFromNow();
    await prisma.session.update({ where: { id: session.id }, data: { expiresAt } });
    // Cookies can only be written from route handlers / server functions; ignore elsewhere.
    await setCookie(token, expiresAt).catch(() => {});
  }

  return session;
}

/** Deletes the current session row and clears the cookie. */
export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  store.delete(SESSION_COOKIE);
}

/** Signs a user out everywhere except the current session (after a password change). */
export async function destroyOtherSessions(userId: string) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  await prisma.session.deleteMany({
    where: { userId, ...(token ? { NOT: { tokenHash: hashToken(token) } } : {}) },
  });
}
