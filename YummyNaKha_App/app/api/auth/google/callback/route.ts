import { finishGoogleSignIn, GoogleSignInError } from "@/lib/server/auth/google";
import { HttpError, route } from "@/lib/server/http";

const redirect = (location: string) => new Response(null, { status: 302, headers: { Location: location } });

/**
 * GET /api/auth/google/callback — Google sends the browser back here. On
 * success the session cookie is set and Sign In routes the user onward
 * (My Taste for a new account, Home otherwise).
 */
export const GET = route(async (request) => {
  try {
    await finishGoogleSignIn(request);
    return redirect("/sign-in");
  } catch (error) {
    const reason = error instanceof GoogleSignInError ? error.reason : error instanceof HttpError ? "unavailable" : "failed";
    if (!(error instanceof GoogleSignInError || error instanceof HttpError)) console.error("[google] sign-in failed:", error);
    return redirect(`/sign-in?google=${reason}`);
  }
});
