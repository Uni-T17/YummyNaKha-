import { requireUser } from "@/lib/server/auth/current-user";
import { acceptDocuments, listConsentRecords } from "@/lib/server/consent/service";
import { json, parseJson, route } from "@/lib/server/http";
import { acceptConsentSchema } from "@/lib/server/validation/consent";

/** GET /api/consents — the signed-in user's full acceptance / withdrawal history. */
export const GET = route(async () => {
  const user = await requireUser();
  return json({ records: await listConsentRecords(user.id) });
});

/** POST /api/consents — accept documents at their current versions. */
export const POST = route(async (request) => {
  const user = await requireUser();
  const { documents } = await parseJson(request, acceptConsentSchema);
  return json({ records: await acceptDocuments(user.id, documents) }, { status: 201 });
});
