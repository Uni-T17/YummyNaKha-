import "server-only";
import type { z } from "zod";
import { getGeminiConfig } from "../env";

// Minimal Google Gemini client for the optional Menu helper. One JSON answer
// per call, constrained by a response schema and checked again with zod. All
// configured models together get one time budget; a model that just failed is
// tried last for a while, so the next request goes straight to one that works.
// Returns null on any problem — every caller has a non-AI fallback.

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const COOLDOWN_MS = 10 * 60 * 1000;
const coolingUntil = new Map<string, number>();

export async function generateJson<T extends z.ZodType>(params: {
  instruction: string;
  text: string;
  /** Gemini responseSchema (OpenAPI subset). */
  responseSchema: Record<string, unknown>;
  schema: T;
  budgetMs: number;
}): Promise<{ data: z.infer<T>; model: string } | null> {
  const config = getGeminiConfig();
  if (!config) return null;

  const deadline = Date.now() + params.budgetMs;
  const ready = (m: string) => (coolingUntil.get(m) ?? 0) <= Date.now();
  const models = [...config.models.filter(ready), ...config.models.filter((m) => !ready(m))];

  for (const model of models) {
    const remaining = deadline - Date.now();
    if (remaining < 500) break;
    try {
      const response = await fetch(`${BASE}/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: { "x-goog-api-key": config.apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: params.instruction }] },
          contents: [{ role: "user", parts: [{ text: params.text }] }],
          generationConfig: { temperature: 0, responseMimeType: "application/json", responseSchema: params.responseSchema },
        }),
        signal: AbortSignal.timeout(remaining),
      });
      if (response.status === 400) {
        // Our request was wrong, not the model busy: no point trying others or cooling this one down.
        console.error(`[gemini] ${model} rejected the request (400)`);
        return null;
      }
      if (!response.ok) {
        console.warn(`[gemini] ${model} answered ${response.status}; trying the next model`);
        coolingUntil.set(model, Date.now() + COOLDOWN_MS);
        continue;
      }
      coolingUntil.delete(model);
      const body = (await response.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const raw = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      let parsed: unknown = null;
      try {
        parsed = JSON.parse(raw);
      } catch {
        // handled below as an unexpected answer
      }
      const answer = params.schema.safeParse(parsed);
      if (!answer.success) {
        console.warn(`[gemini] ${model} gave an unexpected answer`);
        return null;
      }
      return { data: answer.data, model };
    } catch (error) {
      console.warn(`[gemini] ${model} failed:`, error instanceof Error ? error.name : error);
      coolingUntil.set(model, Date.now() + COOLDOWN_MS);
    }
  }
  console.warn("[gemini] no answer in time");
  return null;
}
