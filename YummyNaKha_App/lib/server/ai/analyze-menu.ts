import "server-only";
import { Prisma, ProcessingStatus } from "@/lib/generated/prisma/client";
import type { ExtractedDish } from "@/lib/types";
import { assertProcessingConsent } from "../consent/service";
import { prisma } from "../db";
import { errors, HttpError } from "../http";
import { getPreferenceFlags } from "../preferences/service";
import { analyzeMenuText } from "./analyze-content";
import { processMenuImage, type ProcessedImage } from "./process-image";

// The full "Find My Food" pipeline:
//   consent check → images (Hugging Face OCR + translation, cached) →
//   current user's favourites & dislikes → Gemini → validated result →
//   saved MenuAnalysis → dishes for the Menu screen.

export interface MenuAnalysisResult {
  analysisId: string;
  dishes: ExtractedDish[];
  summary: string;
}

export async function analyzeMenu(userId: string, imageIds: string[]): Promise<MenuAnalysisResult> {
  // Nothing leaves the server for a third-party AI without stored consent (LR2, FE2 AC4).
  await assertProcessingConsent(userId);

  const owned = await prisma.menuImage.count({ where: { userId, id: { in: imageIds } } });
  if (owned !== imageIds.length) throw errors.notFound("One of these menu photos wasn't found. Please upload it again.");

  // One photo at a time keeps provider rate limits predictable.
  const pages: ProcessedImage[] = [];
  for (const id of imageIds) pages.push(await processMenuImage(userId, id));

  const preferences = await getPreferenceFlags(userId);

  const analysis = await prisma.menuAnalysis.create({
    data: {
      userId,
      status: ProcessingStatus.PROCESSING,
      preferencesSnapshot: preferences as Prisma.InputJsonValue,
      images: { create: imageIds.map((imageId) => ({ imageId })) },
    },
    select: { id: true },
  });

  try {
    const joinPages = (pick: (p: ProcessedImage) => string) =>
      pages.map((p, i) => (pages.length > 1 ? `--- Page ${i + 1} ---\n${pick(p)}` : pick(p))).join("\n\n");

    const result = await analyzeMenuText({
      analysisId: analysis.id,
      thaiText: joinPages((p) => p.extractedText),
      englishText: joinPages((p) => p.translatedText),
      preferences,
    });

    await prisma.menuAnalysis.update({
      where: { id: analysis.id },
      data: {
        status: ProcessingStatus.PROCESSED,
        model: result.model,
        result: {
          dishes: result.dishes,
          summary: result.summary,
          confidence: result.confidence,
          discarded: result.discarded,
        } as unknown as Prisma.InputJsonValue,
      },
    });

    return { analysisId: analysis.id, dishes: result.dishes, summary: result.summary };
  } catch (error) {
    const message = error instanceof HttpError ? error.message : "Menu analysis failed.";
    await prisma.menuAnalysis
      .update({ where: { id: analysis.id }, data: { status: ProcessingStatus.FAILED, error: message } })
      .catch(() => {});
    throw error;
  }
}
