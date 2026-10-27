import "server-only";
import { Prisma, ProcessingStatus } from "@/lib/generated/prisma/client";
import type { ExtractedDish } from "@/lib/types";
import { AI_HELPER_CONSENT, hasAccepted } from "@/lib/consent";
import { assertProcessingConsent, listConsentRecords } from "../consent/service";
import { prisma } from "../db";
import { errors, HttpError } from "../http";
import { buildDishes, findMeatMenu } from "../menu/build-dishes";
import { parseMenuLines } from "../menu/parse-ocr";
import { GUIDE_VERSION } from "../thai-food/dishes";
import { getPreferenceFlags } from "../preferences/service";
import { pairDishesWithMeats } from "./pair-meats";
import { processMenuImage } from "./process-image";

// The full "Find My Food" pipeline, entirely on our own server:
//   terms check → photos read by our OCR service (cached) → menu lines with
//   prices → matched to the Thai dish guide → saved MenuAnalysis → dishes for
//   the Menu screen. Top Pick / Check First / Avoid is applied by
//   lib/matching.ts against the diner's profile.
// Optional: on a made-to-order menu, and only with the Menu helper consent,
// Google Gemini pairs the dishes with the menu's meats (pair-meats.ts).

export interface MenuAnalysisResult {
  analysisId: string;
  dishes: ExtractedDish[];
  summary: string;
}

export async function analyzeMenu(userId: string, imageIds: string[]): Promise<MenuAnalysisResult> {
  await assertProcessingConsent(userId);

  const owned = await prisma.menuImage.count({ where: { userId, id: { in: imageIds } } });
  if (owned !== imageIds.length) throw errors.notFound("One of these menu photos wasn't found. Please upload it again.");

  // The OCR service reads one photo at a time anyway.
  const pages = [];
  for (const id of imageIds) pages.push(await processMenuImage(userId, id));

  const analysis = await prisma.menuAnalysis.create({
    data: {
      userId,
      status: ProcessingStatus.PROCESSING,
      // Internal quality record of what the result was based on (LR10). Stays on our server.
      preferencesSnapshot: (await getPreferenceFlags(userId)) as Prisma.InputJsonValue,
      images: { create: imageIds.map((imageId) => ({ imageId })) },
    },
    select: { id: true },
  });

  try {
    const items = pages.flatMap((page) => parseMenuLines(page.lines));
    const meatMenu = findMeatMenu(items);
    const pairing =
      meatMenu && hasAccepted(await listConsentRecords(userId), [AI_HELPER_CONSENT]) ? await pairDishesWithMeats(meatMenu) : null;
    const dishes = buildDishes(items, analysis.id, pairing?.pairs);
    if (dishes.length === 0) {
      throw new HttpError(422, "MENU_UNREADABLE", "We couldn't find any dishes in this photo. Try a clearer photo of the dish list.");
    }

    const known = dishes.filter((d) => d.inGuide).length;
    const summary = `Found ${dishes.length} dishes — ${known} are in our Thai dish guide.`;

    await prisma.menuAnalysis.update({
      where: { id: analysis.id },
      data: {
        status: ProcessingStatus.PROCESSED,
        model: `thai-dish-guide@${GUIDE_VERSION}${pairing ? ` + ${pairing.model} (pairing)` : ""}`,
        // Internal quality record (LR10): which lines Gemini paired, if it was used.
        result: {
          dishes,
          summary,
          items,
          ...(pairing ? { pairing: { model: pairing.model, pairs: pairing.pairs.map((p) => [p.dish.name, p.meat.name]) } } : {}),
        } as unknown as Prisma.InputJsonValue,
      },
    });

    return { analysisId: analysis.id, dishes, summary };
  } catch (error) {
    const message = error instanceof HttpError ? error.message : "Menu analysis failed.";
    await prisma.menuAnalysis
      .update({ where: { id: analysis.id }, data: { status: ProcessingStatus.FAILED, error: message } })
      .catch(() => {});
    throw error;
  }
}
