import { toPublicUser } from "@/lib/server/auth/current-user";
import { loginUser } from "@/lib/server/auth/service";
import { json, parseJson, route } from "@/lib/server/http";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { loginSchema } from "@/lib/server/validation/auth";

/** POST /api/auth/login — verify credentials and start a session. */
export const POST = route(async (request) => {
  const input = await parseJson(request, loginSchema);
  rateLimit(`login:${clientIp(request)}:${input.email}`, 10, 15 * 60 * 1000);
  const user = await loginUser(input);
  return json({ user: toPublicUser(user), onboarded: user.onboardedAt !== null });
});
