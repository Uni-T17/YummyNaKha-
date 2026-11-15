import { getCurrentUser, requireUser, toPublicUser } from "@/lib/server/auth/current-user";
import { deleteAccount, updateProfile } from "@/lib/server/auth/service";
import { errors, json, parseJson, route } from "@/lib/server/http";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { deleteAccountSchema, updateMeSchema } from "@/lib/server/validation/auth";

/** GET /api/auth/me — the signed-in user (never the password hash). */
export const GET = route(async () => {
  const user = await getCurrentUser();
  if (!user) throw errors.unauthorized();
  return json({ user: toPublicUser(user), onboarded: user.onboardedAt !== null });
});

/** PATCH /api/auth/me — rename, or mark onboarding (My Taste) as done. */
export const PATCH = route(async (request) => {
  const user = await requireUser();
  const input = await parseJson(request, updateMeSchema);
  const updated = await updateProfile(user.id, input);
  return json({ user: toPublicUser(updated), onboarded: updated.onboardedAt !== null });
});

/** DELETE /api/auth/me — delete the account and all its data (PDPA). Body: { password }. */
export const DELETE = route(async (request) => {
  const user = await requireUser();
  rateLimit(`delete-account:${user.id}:${clientIp(request)}`, 5, 15 * 60 * 1000);
  const input = await parseJson(request, deleteAccountSchema);
  await deleteAccount(user, input);
  return new Response(null, { status: 204 });
});
