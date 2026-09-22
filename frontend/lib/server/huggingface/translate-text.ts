import "server-only";
import { TRANSLATE_SYSTEM_PROMPT } from "../ai/read-prompts";
import { containsThai, fenceUntrusted, normalizeModelText } from "../ai/text";
import { getHuggingFaceConfig } from "../env";
import { errors } from "../http";
import { chatCompletion } from "./client";

// Thai → English with a separately configurable chat model (HUGGINGFACE_TRANSLATION_MODEL).

export async function translateMenuText(thaiText: string) {
  if (!containsThai(thaiText)) return { text: thaiText, model: null, metadata: { skipped: true } };

  const { translationModel } = getHuggingFaceConfig();
  const result = await chatCompletion({
    model: translationModel,
    temperature: 0,
    maxTokens: 4096,
    messages: [
      { role: "system", content: TRANSLATE_SYSTEM_PROMPT },
      { role: "user", content: `<menu_text>\n${fenceUntrusted(thaiText)}\n</menu_text>` },
    ],
  });

  const text = normalizeModelText(result.content);
  if (!text) throw errors.badGateway("We couldn't translate this menu. Please try again.");
  return {
    text,
    model: result.model,
    metadata: { provider: "huggingface", finishReason: result.finishReason, truncated: result.finishReason === "length", usage: result.usage },
  };
}
