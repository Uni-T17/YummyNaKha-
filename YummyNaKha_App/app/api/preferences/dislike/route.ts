import { PreferenceType } from "@/lib/generated/prisma/client";
import { requireUser } from "@/lib/server/auth/current-user";
import { json, parseJson, route } from "@/lib/server/http";
import { removePreference, setPreference } from "@/lib/server/preferences/service";
import { dislikeSchema, removePreferenceSchema } from "@/lib/server/validation/preferences";

/** POST /api/preferences/dislike — add to the Avoid list (moves it off Favs if it was there). */
export const POST = route(async (request) => {
  const user = await requireUser();
  const { name, reason } = await parseJson(request, dislikeSchema);
  return json({ profile: await setPreference(user.id, name, PreferenceType.DISLIKE, reason) });
});

/** DELETE /api/preferences/dislike — remove from the Avoid list. */
export const DELETE = route(async (request) => {
  const user = await requireUser();
  const { name } = await parseJson(request, removePreferenceSchema);
  return json({ profile: await removePreference(user.id, name, PreferenceType.DISLIKE) });
});
