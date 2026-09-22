import { processMenuImage } from "@/lib/server/ai/process-image";
import { requireUser } from "@/lib/server/auth/current-user";
import { assertProcessingConsent } from "@/lib/server/consent/service";
import { json, parseJson, route } from "@/lib/server/http";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { extractTextSchema } from "@/lib/server/validation/ai";

export const maxDuration = 120;

/** POST /api/ai/extract-text — OCR + translate one uploaded photo via Hugging Face. */
export const POST = route(async (request) => {
  const user = await requireUser();
  const { imageId } = await parseJson(request, extractTextSchema);
  // The photo goes to a third-party AI provider, so the transfer consent is required (LR2).
  await assertProcessingConsent(user.id);
  rateLimit(`ai:${user.id}:${clientIp(request)}`, 30, 60 * 60 * 1000);
  return json({ image: await processMenuImage(user.id, imageId) });
});
