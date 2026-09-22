import "server-only";
import { OCR_PROVIDER } from "@/lib/ai-provider";
import { extractMenuTextWithGemini } from "../gemini/extract-text";
import { translateMenuTextWithGemini } from "../gemini/translate-text";
import { extractMenuText } from "../huggingface/extract-text";
import { translateMenuText } from "../huggingface/translate-text";

// Picks the OCR + translation provider from OCR_PROVIDER (default: Hugging Face).

export function readMenuImage(image: { data: Uint8Array; mimeType: string }) {
  return OCR_PROVIDER === "gemini" ? extractMenuTextWithGemini(image) : extractMenuText(image);
}

export function translateMenu(thaiText: string) {
  return OCR_PROVIDER === "gemini" ? translateMenuTextWithGemini(thaiText) : translateMenuText(thaiText);
}
