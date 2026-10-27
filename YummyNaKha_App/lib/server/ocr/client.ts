import "server-only";
import { z } from "zod";
import { getOcrServiceUrl } from "../env";
import { errors, HttpError } from "../http";

// Client for our own OCR service (ocr-service/, PaddleOCR). It runs on our
// server, so the menu photo is never sent to a third party (LR2, LR3).

const TIMEOUT_MS = 60_000;

const ocrLineSchema = z.object({
  text: z.string(),
  score: z.number(),
  box: z.tuple([z.number(), z.number(), z.number(), z.number()]),
});

const ocrResponseSchema = z.object({
  width: z.number(),
  height: z.number(),
  lines: z.array(ocrLineSchema),
  model: z.string(),
  elapsedMs: z.number(),
});

export type OcrLine = z.infer<typeof ocrLineSchema>;
export type OcrResult = z.infer<typeof ocrResponseSchema>;

export class UnreadableImageError extends HttpError {
  constructor() {
    super(
      422,
      "MENU_UNREADABLE",
      "We couldn't find readable menu text in this photo. Try a clearer, well-lit photo taken straight on.",
    );
  }
}

export async function readMenuImage(image: { data: Uint8Array; mimeType: string }): Promise<OcrResult> {
  let response: Response;
  try {
    response = await fetch(`${getOcrServiceUrl()}/ocr`, {
      method: "POST",
      headers: { "Content-Type": image.mimeType },
      body: Buffer.from(image.data),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    console.error(
      "[ocr] request failed:",
      timedOut ? "timeout" : `${(error as Error).message} — is the OCR service running? (npm run ocr)`,
    );
    throw errors.serviceUnavailable(
      timedOut
        ? "Reading the menu took too long. Please try again."
        : "The menu reader isn't available right now. Please try again in a moment.",
    );
  }

  if (response.status === 415) throw new UnreadableImageError();
  if (!response.ok) {
    console.error(`[ocr] HTTP ${response.status}: ${(await response.text().catch(() => "")).slice(0, 200)}`);
    throw errors.badGateway("We couldn't read this photo. Please try again.");
  }

  const parsed = ocrResponseSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) {
    console.error("[ocr] unexpected response shape");
    throw errors.badGateway("We couldn't read this photo. Please try again.");
  }
  if (!parsed.data.lines.some((l) => /[ก-ฮ]/.test(l.text))) throw new UnreadableImageError();
  return parsed.data;
}
