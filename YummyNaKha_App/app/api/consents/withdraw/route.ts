import { requireUser } from "@/lib/server/auth/current-user";
import { withdrawConsent } from "@/lib/server/consent/service";
import { json, parseJson, route } from "@/lib/server/http";
import { withdrawConsentSchema } from "@/lib/server/validation/consent";

/** POST /api/consents/withdraw — record a withdrawal (stored like an acceptance). */
export const POST = route(async (request) => {
  const user = await requireUser();
  const { document } = await parseJson(request, withdrawConsentSchema);
  return json({ records: await withdrawConsent(user.id, document) });
});
