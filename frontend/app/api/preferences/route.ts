import { requireUser } from "@/lib/server/auth/current-user";
import { json, route } from "@/lib/server/http";
import { getTasteProfile } from "@/lib/server/preferences/service";

/** GET /api/preferences — the signed-in user's Favs and Avoid list. */
export const GET = route(async () => {
  const user = await requireUser();
  return json({ profile: await getTasteProfile(user.id) });
});
