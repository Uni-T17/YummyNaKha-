import "server-only";
import { getGeminiConfig } from "../env";
import { errors } from "../http";

// Minimal Gemini REST client (models.generateContent). Server-only: the key is
// sent in a header and never reaches the browser.

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const TIMEOUT_MS = 90_000;

type Part = { text: string } | { inline_data: { mime_type: string; data: string } };

interface RawResponse {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
  modelVersion?: string;
}

interface GenerateResult {
  text: string;
  model: string;
  finishReason: string | null;
  usage: { promptTokens?: number; outputTokens?: number } | null;
}

/** Temporary Gemini failures worth retrying (overload, rate limit, server error). */
const RETRYABLE = new Set([429, 500, 503, 504]);
/** One short retry on "busy" before moving to the next model. */
const BACKOFF_MS = [1000];

// Models that recently failed are skipped for a while, so the three calls in
// one menu analysis (read → translate → analyze) don't each wait on a busy model.
const OVERLOADED_COOLDOWN_MS = 3 * 60 * 1000;
const QUOTA_COOLDOWN_MS = 30 * 60 * 1000;
const unhealthyUntil = new Map<string, number>();

function isHealthy(model: string) {
  return (unhealthyUntil.get(model) ?? 0) <= Date.now();
}

function markUnhealthy(model: string, status: number) {
  unhealthyUntil.set(model, Date.now() + (status === 429 ? QUOTA_COOLDOWN_MS : OVERLOADED_COOLDOWN_MS));
}

class RetryableError extends Error {
  constructor(public status: number) {
    super(`retryable ${status}`);
  }
}

/** The model doesn't exist or isn't offered to this key — move on to the next one. */
class ModelUnavailableError extends Error {}

/**
 * Tries the primary model with backoff, then the fallback model. Free-tier
 * keys often hit "high demand" (503) or per-model rate limits (429).
 */
async function generate(params: {
  systemInstruction: string;
  parts: Part[];
  generationConfig: Record<string, unknown>;
}): Promise<GenerateResult> {
  const { model, fallbackModels } = getGeminiConfig();
  const configured = Array.from(new Set([model, ...fallbackModels]));
  // Healthy models first; recently failing ones only as a last resort.
  const models = [...configured.filter(isHealthy), ...configured.filter((m) => !isHealthy(m))];
  let lastStatus = 0;

  for (const [index, m] of models.entries()) {
    attempts: for (let attempt = 0; attempt <= BACKOFF_MS.length; attempt++) {
      try {
        const result = await generateOnce(m, params);
        unhealthyUntil.delete(m);
        return result;
      } catch (error) {
        if (error instanceof ModelUnavailableError) {
          markUnhealthy(m, 404);
          break attempts;
        }
        if (!(error instanceof RetryableError)) throw error;
        lastStatus = error.status;
        // Quota errors won't clear in a second; don't retry the same model.
        if (error.status === 429 || attempt === BACKOFF_MS.length) {
          markUnhealthy(m, error.status);
          break attempts;
        }
        await new Promise((r) => setTimeout(r, BACKOFF_MS[attempt]));
      }
    }
    const next = models[index + 1];
    if (next) console.warn(`[gemini] ${m} unavailable (${lastStatus || 404}), trying ${next}`);
  }

  if (lastStatus === 0) {
    console.error(`[gemini] none of the configured models are available to this key: ${models.join(", ")}`);
    throw errors.serviceUnavailable();
  }
  if (lastStatus === 429) throw errors.serviceUnavailable("The menu assistant is busy right now. Please try again in a minute.");
  throw errors.serviceUnavailable("The AI service is very busy right now. Please try again in a few minutes.");
}

async function generateOnce(
  model: string,
  params: { systemInstruction: string; parts: Part[]; generationConfig: Record<string, unknown> },
): Promise<GenerateResult> {
  const { apiKey } = getGeminiConfig();

  let response: Response;
  try {
    response = await fetch(`${BASE}/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: params.systemInstruction }] },
        contents: [{ role: "user", parts: params.parts }],
        generationConfig: params.generationConfig,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    console.error("[gemini] request failed:", timedOut ? "timeout" : (error as Error).message);
    throw errors.badGateway(timedOut ? "The AI took too long to respond. Please try again." : undefined);
  }

  if (!response.ok) {
    const excerpt = (await response.text().catch(() => "")).slice(0, 300);
    if (RETRYABLE.has(response.status)) {
      // Expected on the free tier; one short line instead of the full body.
      console.warn(`[gemini] ${model} → HTTP ${response.status} (${response.status === 429 ? "quota / rate limit" : "busy"})`);
      throw new RetryableError(response.status);
    }
    console.error(`[gemini] ${model} → HTTP ${response.status}: ${excerpt}`);
    if (response.status === 404) throw new ModelUnavailableError();
    if (response.status === 401 || response.status === 403) throw errors.serviceUnavailable();
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
    throw errors.badGateway("The AI response came back incomplete. Please try again.");
  }

  return {
    text,
    model: raw?.modelVersion ?? model,
    finishReason: candidate?.finishReason ?? null,
    usage: raw?.usageMetadata
      ? { promptTokens: raw.usageMetadata.promptTokenCount, outputTokens: raw.usageMetadata.candidatesTokenCount }
      : null,
  };
}

export interface GeminiJsonResult {
  data: unknown;
  model: string;
  usage: { promptTokens?: number; outputTokens?: number } | null;
}

/** Text in, JSON out, constrained by `responseSchema` (OpenAPI subset). */
export async function generateJson(params: {
  systemInstruction: string;
  userText: string;
  responseSchema: Record<string, unknown>;
  temperature?: number;
}): Promise<GeminiJsonResult> {
  const result = await generate({
    systemInstruction: params.systemInstruction,
    parts: [{ text: params.userText }],
    generationConfig: {
      temperature: params.temperature ?? 0.2,
      responseMimeType: "application/json",
      responseSchema: params.responseSchema,
    },
  });

  try {
    return { data: JSON.parse(result.text), model: result.model, usage: result.usage };
  } catch {
    console.error("[gemini] response was not valid JSON");
    throw errors.badGateway("The menu analysis came back in an unexpected format. Please try again.");
  }
}

/** Plain-text generation, optionally with one image (used for OCR and translation). */
export async function generateText(params: {
  systemInstruction: string;
  text: string;
  image?: { data: Uint8Array; mimeType: string };
}): Promise<GenerateResult> {
  const parts: Part[] = [];
  if (params.image) {
    parts.push({
      inline_data: { mime_type: params.image.mimeType, data: Buffer.from(params.image.data).toString("base64") },
    });
  }
  parts.push({ text: params.text });
  return generate({ systemInstruction: params.systemInstruction, parts, generationConfig: { temperature: 0 } });
}
