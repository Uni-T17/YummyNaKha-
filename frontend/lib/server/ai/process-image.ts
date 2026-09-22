import "server-only";
import { Prisma, ProcessingStatus } from "@/lib/generated/prisma/client";
import { prisma } from "../db";
import { errors, HttpError } from "../http";
import { extractMenuText } from "../huggingface/extract-text";
import { translateMenuText } from "../huggingface/translate-text";

// Image → Hugging Face OCR → translation → database.
// Results are cached on the MenuImage row, so re-analyzing the same photo
// doesn't call Hugging Face again. The raw image bytes are deleted once the
// text has been read (photos are kept only for the scan session).

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

  // Claim the image atomically so two concurrent requests don't both call the AI.
  const claimed = await prisma.menuImage.updateMany({
    where: { id: image.id, userId, status: { in: [ProcessingStatus.UPLOADED, ProcessingStatus.FAILED] } },
    data: { status: ProcessingStatus.PROCESSING, error: null },
  });
  if (claimed.count === 0) throw errors.conflict("This photo is already being read. Please wait a moment.");

  try {
    const ocr = await extractMenuText({ data: image.data, mimeType: image.mimeType });
    const translation = await translateMenuText(ocr.text);

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
