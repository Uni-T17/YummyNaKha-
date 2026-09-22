import "server-only";
import { finalizeOcrText, OCR_SYSTEM_PROMPT, OCR_USER_PROMPT } from "../ai/read-prompts";
import { containsThai } from "../ai/text";
import { generateText } from "./client";

// OCR with Gemini (free-tier alternative to Hugging Face; OCR_PROVIDER=gemini).

export async function extractMenuTextWithGemini(image: { data: Uint8Array; mimeType: string }) {
  const result = await generateText({ systemInstruction: OCR_SYSTEM_PROMPT, text: OCR_USER_PROMPT, image });
  const text = finalizeOcrText(result.text);
  return {
    text,
    model: result.model,
    metadata: { provider: "gemini", finishReason: result.finishReason, containsThai: containsThai(text), usage: result.usage },
  };
}
