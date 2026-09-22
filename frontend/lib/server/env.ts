import "server-only";
import { z } from "zod";
import { HttpError } from "./http";

// Server-side configuration. Read lazily so a missing AI key only breaks the
// feature that needs it, not the whole app. None of these values are ever
// sent to the browser (no NEXT_PUBLIC_ prefix).

function read<T extends z.ZodType>(schema: T, value: unknown, name: string): z.infer<T> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    console.error(`[env] ${name} is missing or invalid`);
    throw new HttpError(503, "SERVICE_UNAVAILABLE", "This feature is not configured yet. Please try again later.");
  }
  return parsed.data;
}

export function getAuthSecret(): string {
  return read(z.string().min(32), process.env.AUTH_SECRET, "AUTH_SECRET");
}

export const DEFAULT_HF_MODEL = "Qwen/Qwen3.8-27B";
export const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash";

export function getHuggingFaceConfig() {
  return {
    apiKey: read(z.string().min(1), process.env.HUGGINGFACE_API_KEY, "HUGGINGFACE_API_KEY"),
    ocrModel: process.env.HUGGINGFACE_MODEL?.trim() || DEFAULT_HF_MODEL,
    translationModel: process.env.HUGGINGFACE_TRANSLATION_MODEL?.trim() || DEFAULT_HF_MODEL,
  };
}

export function getGeminiConfig() {
  return {
    apiKey: read(z.string().min(1), process.env.GEMINI_API_KEY, "GEMINI_API_KEY"),
    model: process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
  };
}
