import "server-only";
import { TRANSLATE_SYSTEM_PROMPT } from "../ai/read-prompts";
import { containsThai, fenceUntrusted, normalizeModelText } from "../ai/text";
import { errors } from "../http";
import { generateText } from "./client";

// Thai → English with Gemini (OCR_PROVIDER=gemini).

export async function translateMenuTextWithGemini(thaiText: string) {
  if (!containsThai(thaiText)) return { text: thaiText, model: null, metadata: { skipped: true } };

  const result = await generateText({
    systemInstruction: TRANSLATE_SYSTEM_PROMPT,
    text: `<menu_text>\n${fenceUntrusted(thaiText)}\n</menu_text>`,
  });
  const text = normalizeModelText(result.text);
  if (!text) throw errors.badGateway("We couldn't translate this menu. Please try again.");
  return { text, model: result.model, metadata: { provider: "gemini", finishReason: result.finishReason, usage: result.usage } };
}
