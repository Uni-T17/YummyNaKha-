import "server-only";
import { getGeminiConfig } from "../env";
import { errors } from "../http";

// Minimal Gemini REST client (models.generateContent) with JSON-schema output.
// Server-only: the key is sent in a header and never reaches the browser.

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const TIMEOUT_MS = 90_000;

interface RawResponse {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
  modelVersion?: string;
}

export interface GeminiJsonResult {
  data: unknown;
  model: string;
  usage: { promptTokens?: number; outputTokens?: number } | null;
}

export async function generateJson(params: {
  systemInstruction: string;
  userText: string;
  /** OpenAPI-subset schema accepted by `generationConfig.responseSchema`. */
  responseSchema: Record<string, unknown>;
  temperature?: number;
}): Promise<GeminiJsonResult> {
  const { apiKey, model } = getGeminiConfig();

  let response: Response;
  try {
    response = await fetch(`${BASE}/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: params.systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: params.userText }] }],
        generationConfig: {
          temperature: params.temperature ?? 0.2,
          responseMimeType: "application/json",
          responseSchema: params.responseSchema,
        },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    console.error("[gemini] request failed:", timedOut ? "timeout" : (error as Error).message);
    throw errors.badGateway(timedOut ? "Sorting the menu took too long. Please try again." : undefined);
  }

  if (!response.ok) {
    const excerpt = (await response.text().catch(() => "")).slice(0, 300);
    console.error(`[gemini] ${model} → HTTP ${response.status}: ${excerpt}`);
    if (response.status === 401 || response.status === 403) throw errors.serviceUnavailable();
    if (response.status === 429) throw errors.serviceUnavailable("The menu assistant is busy right now. Please try again in a minute.");
    throw errors.badGateway();
  }

  const raw = (await response.json().catch(() => null)) as RawResponse | null;
  if (raw?.promptFeedback?.blockReason) {
    console.error("[gemini] prompt blocked:", raw.promptFeedback.blockReason);
    throw errors.badGateway("We couldn't analyze this menu. Please try a different photo.");
  }

  const candidate = raw?.candidates?.[0];
  const text = candidate?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text || (candidate?.finishReason && candidate.finishReason !== "STOP")) {
    console.error("[gemini] incomplete response:", candidate?.finishReason ?? "empty");
    throw errors.badGateway("The menu analysis came back incomplete. Please try again.");
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("[gemini] response was not valid JSON");
    throw errors.badGateway("The menu analysis came back in an unexpected format. Please try again.");
  }

  return {
    data,
    model: raw?.modelVersion ?? model,
    usage: raw?.usageMetadata
      ? { promptTokens: raw.usageMetadata.promptTokenCount, outputTokens: raw.usageMetadata.candidatesTokenCount }
      : null,
  };
}
