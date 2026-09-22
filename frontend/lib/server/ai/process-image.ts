import "server-only";
import { Prisma, ProcessingStatus } from "@/lib/generated/prisma/client";
import { prisma } from "../db";
import { errors, HttpError } from "../http";
import { readMenuImage, translateMenu } from "./read-menu";

// Image → OCR → translation → database (Hugging Face, or Gemini when
// OCR_PROVIDER=gemini). Results are cached on the MenuImage row, so
// re-analyzing the same photo doesn't call the AI again. The raw image bytes are deleted once the
// text has been read (photos are kept only for the scan session).

/** A PROCESSING claim older than this is treated as abandoned. */
const STALE_MS = 3 * 60 * 1000;
const WAIT_TIMEOUT_MS = 150_000;

async function waitForProcessing(userId: string, imageId: string): Promise<ProcessedImage> {
  const deadline = Date.now() + WAIT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const row = await prisma.menuImage.findFirst({
      where: { id: imageId, userId },
      select: { status: true, extractedText: true, translatedText: true, error: true },
    });
    if (!row) throw errors.notFound("Menu photo not found.");
    if (row.status === ProcessingStatus.PROCESSED && row.extractedText && row.translatedText) {
      return { id: imageId, extractedText: row.extractedText, translatedText: row.translatedText };
    }
    if (row.status === ProcessingStatus.FAILED) {
      throw errors.badGateway(row.error ?? "We couldn't read this photo. Please try again.");
    }
  }
  throw errors.badGateway("Reading the menu took too long. Please try again.");
}

export interface ProcessedImage {
  id: string;
  extractedText: string;
  translatedText: string;
}

export async function processMenuImage(userId: string, imageId: string): Promise<ProcessedImage> {
  const image = await prisma.menuImage.findFirst({ where: { id: imageId, userId } });
  if (!image) throw errors.notFound("Menu photo not found.");

  if (image.status === ProcessingStatus.PROCESSED && image.extractedText && image.translatedText) {
    return { id: image.id, extractedText: image.extractedText, translatedText: image.translatedText };
  }
  if (!image.data) throw errors.conflict("This photo is no longer available. Please upload it again.");

  // Another request is already reading this photo: wait for its result instead of failing.
  if (image.status === ProcessingStatus.PROCESSING && Date.now() - image.updatedAt.getTime() < STALE_MS) {
    return waitForProcessing(userId, image.id);
  }

  // Claim the image atomically so two concurrent requests don't both call the AI.
  // A PROCESSING row older than STALE_MS (e.g. the server restarted mid-run) can be reclaimed.
  const claimed = await prisma.menuImage.updateMany({
    where: {
      id: image.id,
      userId,
      OR: [
        { status: { in: [ProcessingStatus.UPLOADED, ProcessingStatus.FAILED] } },
        { status: ProcessingStatus.PROCESSING, updatedAt: { lt: new Date(Date.now() - STALE_MS) } },
      ],
    },
    data: { status: ProcessingStatus.PROCESSING, error: null },
  });
  if (claimed.count === 0) return waitForProcessing(userId, image.id);

  try {
    const ocr = await readMenuImage({ data: image.data, mimeType: image.mimeType });
    const translation = await translateMenu(ocr.text);

    await prisma.menuImage.update({
      where: { id: image.id },
      data: {
        status: ProcessingStatus.PROCESSED,
        extractedText: ocr.text,
        translatedText: translation.text,
        ocrModel: ocr.model,
        translationModel: translation.model,
        metadata: { ocr: ocr.metadata, translation: translation.metadata } as Prisma.InputJsonValue,
        data: null,
        processedAt: new Date(),
      },
    });

    return { id: image.id, extractedText: ocr.text, translatedText: translation.text };
  } catch (error) {
    const message =
      error instanceof HttpError ? error.message : "We couldn't read this photo. Please try again.";
    await prisma.menuImage
      .update({ where: { id: image.id }, data: { status: ProcessingStatus.FAILED, error: message } })
      .catch(() => {});
    throw error;
  }
}
