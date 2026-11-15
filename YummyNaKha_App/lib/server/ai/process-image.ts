import "server-only";
import { z } from "zod";
import { Prisma, ProcessingStatus } from "@/lib/generated/prisma/client";
import { prisma } from "../db";
import { errors, HttpError } from "../http";
import { readMenuImage, type OcrLine } from "../ocr/client";

// Image → our own OCR service → database. Results are cached on the MenuImage
// row, so re-analyzing the same photo doesn't read it again. The raw image
// bytes are deleted once the text has been read (photos are kept only for the
// scan session, LR5).

/** A PROCESSING claim older than this is treated as abandoned. */
const STALE_MS = 2 * 60 * 1000;
const WAIT_TIMEOUT_MS = 90_000;

const storedLinesSchema = z.array(
  z.object({ text: z.string(), score: z.number(), box: z.tuple([z.number(), z.number(), z.number(), z.number()]) }),
);

const storedSizeSchema = z.object({ width: z.number().positive(), height: z.number().positive() });

export interface ProcessedImage {
  id: string;
  lines: OcrLine[];
  /** The size the OCR boxes refer to (the photo as uploaded); absent for photos read before this was stored. */
  size?: { width: number; height: number };
}

function cachedLines(metadata: Prisma.JsonValue | null): OcrLine[] | null {
  const lines = (metadata as { ocr?: { lines?: unknown } } | null)?.ocr?.lines;
  const parsed = storedLinesSchema.safeParse(lines);
  return parsed.success ? parsed.data : null;
}

function cached(id: string, metadata: Prisma.JsonValue | null): ProcessedImage | null {
  const lines = cachedLines(metadata);
  if (!lines) return null;
  const size = storedSizeSchema.safeParse((metadata as { ocr?: { size?: unknown } } | null)?.ocr?.size);
  return { id, lines, ...(size.success ? { size: size.data } : {}) };
}

async function waitForProcessing(userId: string, imageId: string): Promise<ProcessedImage> {
  const deadline = Date.now() + WAIT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const row = await prisma.menuImage.findFirst({
      where: { id: imageId, userId },
      select: { status: true, metadata: true, error: true },
    });
    if (!row) throw errors.notFound("Menu photo not found.");
    const done = cached(imageId, row.metadata);
    if (row.status === ProcessingStatus.PROCESSED && done) return done;
    if (row.status === ProcessingStatus.FAILED) {
      throw errors.badGateway(row.error ?? "We couldn't read this photo. Please try again.");
    }
  }
  throw errors.badGateway("Reading the menu took too long. Please try again.");
}

export async function processMenuImage(userId: string, imageId: string): Promise<ProcessedImage> {
  const image = await prisma.menuImage.findFirst({ where: { id: imageId, userId } });
  if (!image) throw errors.notFound("Menu photo not found.");

  const done = cached(image.id, image.metadata);
  if (image.status === ProcessingStatus.PROCESSED && done) return done;
  if (!image.data) throw errors.conflict("This photo is no longer available. Please upload it again.");

  // Another request is already reading this photo: wait for its result instead of failing.
  if (image.status === ProcessingStatus.PROCESSING && Date.now() - image.updatedAt.getTime() < STALE_MS) {
    return waitForProcessing(userId, image.id);
  }

  // Claim the image atomically so two concurrent requests don't both read it.
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

    await prisma.menuImage.update({
      where: { id: image.id },
      data: {
        status: ProcessingStatus.PROCESSED,
        extractedText: ocr.lines.map((l) => l.text).join("\n"),
        translatedText: null,
        ocrModel: ocr.model,
        translationModel: null,
        metadata: {
          ocr: { lines: ocr.lines, size: { width: ocr.width, height: ocr.height }, elapsedMs: ocr.elapsedMs },
        } as Prisma.InputJsonValue,
        data: null,
        processedAt: new Date(),
      },
    });

    return { id: image.id, lines: ocr.lines, size: { width: ocr.width, height: ocr.height } };
  } catch (error) {
    const message =
      error instanceof HttpError ? error.message : "We couldn't read this photo. Please try again.";
    await prisma.menuImage
      .update({ where: { id: image.id }, data: { status: ProcessingStatus.FAILED, error: message } })
      .catch(() => {});
    throw error;
  }
}
