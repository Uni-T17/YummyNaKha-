import { requireUser } from "@/lib/server/auth/current-user";
import { json, parseJson, route } from "@/lib/server/http";
import { setSpiceTolerance } from "@/lib/server/preferences/service";
import { spiceSchema } from "@/lib/server/validation/preferences";

/** PUT /api/preferences/spice — the most spice the diner is happy with (or null to clear). */
export const PUT = route(async (request) => {
  const user = await requireUser();
  const { level } = await parseJson(request, spiceSchema);
  return json({ profile: await setSpiceTolerance(user.id, level) });
});
