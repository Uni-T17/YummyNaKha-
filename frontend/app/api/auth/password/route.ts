import { requireUser } from "@/lib/server/auth/current-user";
import { changePassword } from "@/lib/server/auth/service";
import { parseJson, route } from "@/lib/server/http";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { changePasswordSchema } from "@/lib/server/validation/auth";

/** POST /api/auth/password — change password after verifying the current one. */
export const POST = route(async (request) => {
  const user = await requireUser();
  rateLimit(`password:${user.id}:${clientIp(request)}`, 10, 15 * 60 * 1000);
  const input = await parseJson(request, changePasswordSchema);
  await changePassword(user, input);
  return new Response(null, { status: 204 });
});
