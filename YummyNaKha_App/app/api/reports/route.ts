import { requireUser } from "@/lib/server/auth/current-user";
import { createDishReport } from "@/lib/server/guide-feedback/reports";
import { json, parseJson, route } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { dishReportSchema } from "@/lib/server/validation/reports";

/** POST /api/reports — "Report a problem" on a dish, used to fix the Thai dish guide. */
export const POST = route(async (request) => {
  const user = await requireUser();
  rateLimit(`report:${user.id}`, 20, 15 * 60 * 1000);
  await createDishReport(user.id, await parseJson(request, dishReportSchema));
  return json({ ok: true }, { status: 201 });
});
