import "server-only";
import { z } from "zod";
import { getOcrSpaceConfig } from "../env";
import { errors } from "../http";
import type { OcrResult } from "./client";

// The OCR.space API (free tier: 1 MB per photo, 500 photos a day). Used only
// when NEXT_PUBLIC_OCR_PROVIDER=ocrspace, and only after the user accepted the
// "Menu photo reading" agreement (LR2). Only the photo is sent — never who
// uploaded it or their food profile (LR3).

const ENDPOINT = "https://api.ocr.space/parse/image";
const TIMEOUT_MS = 60_000;
export const OCR_SPACE_MAX_BYTES = 1024 * 1024;

const wordSchema = z.object({ Left: z.number(), Top: z.number(), Height: z.number(), Width: z.number() });
const responseSchema = z.object({
  IsErroredOnProcessing: z.boolean().optional(),
  ParsedResults: z
    .array(
      z.object({
        TextOverlay: z
          .object({ Lines: z.array(z.object({ LineText: z.string(), Words: z.array(wordSchema) })) })
          .nullish(),
      }),
    )
    .nullish(),
});

export async function readWithOcrSpace(image: { data: Uint8Array; mimeType: string }): Promise<OcrResult> {
  const { apiKey, engine } = getOcrSpaceConfig();
  if (image.data.byteLength > OCR_SPACE_MAX_BYTES) {
    throw errors.badRequest("This photo is too large to read. Remove it and add it again — the app will make it smaller.");
  }

  const form = new FormData();
  form.append("base64Image", `data:${image.mimeType};base64,${Buffer.from(image.data).toString("base64")}`);
  form.append("OCREngine", engine);
  form.append("language", engine === "1" ? "tha" : "auto");
  form.append("isOverlayRequired", "true");
  form.append("scale", "true");

  const started = Date.now();
  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { apikey: apiKey },
      body: form,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    console.error("[ocr.space] request failed:", timedOut ? "timeout" : (error as Error).message);
    throw errors.serviceUnavailable(
      timedOut ? "Reading the menu took too long. Please try again." : "The menu reader isn't available right now. Please try again in a moment.",
    );
  }

  const body = await response.text();
  if (response.status === 403 || /maximum \d+ number of times/i.test(body)) {
    console.error("[ocr.space] daily limit reached");
    throw errors.serviceUnavailable("The menu reader is busy today. Please try again later.");
  }
  let json: unknown = null;
  try {
    json = JSON.parse(body);
  } catch {
    // handled below
  }
  const parsed = responseSchema.safeParse(json);
  if (!response.ok || !parsed.success || parsed.data.IsErroredOnProcessing) {
    console.error(`[ocr.space] HTTP ${response.status}: ${body.slice(0, 200)}`);
    throw errors.badGateway("We couldn't read this photo. Please try again.");
  }

  const lines = (parsed.data.ParsedResults?.[0]?.TextOverlay?.Lines ?? [])
    .filter((l) => l.Words.length > 0 && l.LineText.trim())
    .map((l) => {
      const x0 = Math.min(...l.Words.map((w) => w.Left));
      const y0 = Math.min(...l.Words.map((w) => w.Top));
      const x1 = Math.max(...l.Words.map((w) => w.Left + w.Width));
      const y1 = Math.max(...l.Words.map((w) => w.Top + w.Height));
      return { text: l.LineText.trim(), score: 1, box: [x0, y0, x1, y1] as [number, number, number, number] };
    });

  return {
    width: Math.max(0, ...lines.map((l) => l.box[2])),
    height: Math.max(0, ...lines.map((l) => l.box[3])),
    lines,
    model: `ocr.space/engine${engine}`,
    elapsedMs: Date.now() - started,
  };
}
