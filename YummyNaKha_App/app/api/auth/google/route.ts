import { startGoogleSignIn } from "@/lib/server/auth/google";
import { HttpError, route } from "@/lib/server/http";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

const redirect = (location: string) => new Response(null, { status: 302, headers: { Location: location } });

/** GET /api/auth/google — sends the browser to Google's sign-in page. */
export const GET = route(async (request) => {
  try {
    rateLimit(`google:${clientIp(request)}`, 20, 15 * 60 * 1000);
    return redirect(await startGoogleSignIn(request));
  } catch (error) {
    // Not configured (503) or too many tries: back to Sign In with a readable message.
    const reason = error instanceof HttpError && error.status === 429 ? "busy" : "unavailable";
    if (!(error instanceof HttpError)) console.error("[google] could not start sign-in:", error);
    return redirect(`/sign-in?google=${reason}`);
  }
});
