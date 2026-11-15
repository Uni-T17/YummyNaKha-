import { AI_HELPER_CONSENT, hasAccepted } from "@/lib/consent";
import { Prisma } from "@/lib/generated/prisma/client";
import { describeUnlisted } from "@/lib/server/ai/describe-unlisted";
import { requireUser } from "@/lib/server/auth/current-user";
import { listConsentRecords } from "@/lib/server/consent/service";
import { prisma } from "@/lib/server/db";
import { errors, HttpError, json, parseJson, route } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { describeSchema } from "@/lib/server/validation/ai";
import type { ExtractedDish } from "@/lib/types";

/**
 * POST /api/ai/describe — after a scan, asks Gemini about the dishes that aren't
 * in our guide (optional Menu helper consent only). Body: { analysisId }.
 * Returns the updated dishes; `available: false` when Gemini isn't configured
 * or didn't answer, so the app just keeps "ask staff".
 */
export const POST = route(async (request) => {
  const user = await requireUser();
  rateLimit(`describe:${user.id}`, 20, 15 * 60 * 1000);
  const { analysisId } = await parseJson(request, describeSchema);

  if (!hasAccepted(await listConsentRecords(user.id), [AI_HELPER_CONSENT])) {
    throw new HttpError(403, "CONSENT_REQUIRED", "Turn on the optional Menu helper to look up dishes that aren't in our guide.");
  }
  const analysis = await prisma.menuAnalysis.findFirst({ where: { id: analysisId, userId: user.id }, select: { result: true } });
  if (!analysis) throw errors.notFound("This menu scan wasn't found.");

  const result = (analysis.result ?? {}) as { dishes?: ExtractedDish[] } & Record<string, unknown>;
  const dishes = result.dishes ?? [];
  const looked = await describeUnlisted(dishes);
  if (!looked) return json({ dishes: [], available: false });
  if (looked.dishes.length === 0) return json({ dishes: [], available: true });

  // Keep the guesses with the scan (internal quality record, LR10).
  const byId = new Map(looked.dishes.map((d) => [d.id, d]));
  await prisma.menuAnalysis.update({
    where: { id: analysisId },
    data: {
      result: { ...result, dishes: dishes.map((d) => byId.get(d.id) ?? d), aiGuessModel: looked.model } as unknown as Prisma.InputJsonValue,
    },
  });
  return json({ dishes: looked.dishes, available: true });
});
