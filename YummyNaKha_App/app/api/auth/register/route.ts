import { toPublicUser } from "@/lib/server/auth/current-user";
import { registerUser } from "@/lib/server/auth/service";
import { json, parseJson, route } from "@/lib/server/http";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { registerSchema } from "@/lib/server/validation/auth";

/** POST /api/auth/register — create an account and sign it in. */
export const POST = route(async (request) => {
  rateLimit(`register:${clientIp(request)}`, 10, 60 * 60 * 1000);
  const input = await parseJson(request, registerSchema);
  const user = await registerUser(input);
  return json({ user: toPublicUser(user), onboarded: false }, { status: 201 });
});
