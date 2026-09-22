// Which service reads (OCR) and translates menu photos. Set OCR_PROVIDER in
// .env ("huggingface" or "gemini"); next.config.ts exposes it here so the
// consent screen and the server always describe the same provider.
// Restart the dev server after changing it.

export type OcrProvider = "huggingface" | "gemini";

export const OCR_PROVIDER: OcrProvider = process.env.NEXT_PUBLIC_OCR_PROVIDER === "gemini" ? "gemini" : "huggingface";
