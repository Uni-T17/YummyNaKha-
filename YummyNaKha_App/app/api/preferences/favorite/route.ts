import { PreferenceType } from "@/lib/generated/prisma/client";
import { requireUser } from "@/lib/server/auth/current-user";
import { json, parseJson, route } from "@/lib/server/http";
import { removePreference, setPreference } from "@/lib/server/preferences/service";
import { favoriteSchema, removePreferenceSchema } from "@/lib/server/validation/preferences";

/** POST /api/preferences/favorite — add a Fav (moves it off the Avoid list if it was there). */
export const POST = route(async (request) => {
  const user = await requireUser();
  const { name } = await parseJson(request, favoriteSchema);
  return json({ profile: await setPreference(user.id, name, PreferenceType.FAVORITE) });
});

/** DELETE /api/preferences/favorite — remove a Fav. */
export const DELETE = route(async (request) => {
  const user = await requireUser();
  const { name } = await parseJson(request, removePreferenceSchema);
  return json({ profile: await removePreference(user.id, name, PreferenceType.FAVORITE) });
});
