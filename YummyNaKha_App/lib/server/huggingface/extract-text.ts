import "server-only";
import { finalizeOcrText, OCR_SYSTEM_PROMPT, OCR_USER_PROMPT } from "../ai/read-prompts";
import { containsThai } from "../ai/text";
import { getHuggingFaceConfig } from "../env";
import { chatCompletion } from "./client";

// OCR with a Hugging Face vision-language model (HUGGINGFACE_MODEL).

export async function extractMenuText(image: { data: Uint8Array; mimeType: string }) {
  const { ocrModel } = getHuggingFaceConfig();
  const dataUrl = `data:${image.mimeType};base64,${Buffer.from(image.data).toString("base64")}`;

  const result = await chatCompletion({
    model: ocrModel,
    temperature: 0,
    maxTokens: 4096,
    messages: [
      { role: "system", content: OCR_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: dataUrl } },
          { type: "text", text: OCR_USER_PROMPT },
        ],
      },
    ],
  });

  const text = finalizeOcrText(result.content);
  return {
    text,
    model: result.model,
    metadata: {
      provider: "huggingface",
      finishReason: result.finishReason,
      truncated: result.finishReason === "length",
      containsThai: containsThai(text),
      usage: result.usage,
    },
  };
}
