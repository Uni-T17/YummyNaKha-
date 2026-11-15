// Which service reads menu photos. A NEXT_PUBLIC_ setting so the browser (consent
// screens) and the server (OCR client) always agree:
//   "local"    — our own PaddleOCR service (ocr-service/), the photo stays with us
//   "ocrspace" — the OCR.space API (free tier), the photo is sent to OCR.space
export const OCR_PROVIDER: "local" | "ocrspace" =
  process.env.NEXT_PUBLIC_OCR_PROVIDER === "ocrspace" ? "ocrspace" : "local";

export const USES_THIRD_PARTY_OCR = OCR_PROVIDER === "ocrspace";
