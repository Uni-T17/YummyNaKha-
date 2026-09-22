import { destroySession } from "@/lib/server/auth/session";
import { route } from "@/lib/server/http";

/** POST /api/auth/logout — invalidate the session and clear the cookie. */
export const POST = route(async () => {
  await destroySession();
  return new Response(null, { status: 204 });
});
