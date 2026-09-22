import "server-only";
import { getHuggingFaceConfig } from "../env";
import { errors } from "../http";

// Minimal client for Hugging Face Inference Providers' OpenAI-compatible chat
// completion endpoint. Called only from the server; the API key never leaves it.

const ENDPOINT = "https://router.huggingface.co/v1/chat/completions";
const TIMEOUT_MS = 90_000;

type ContentPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];
}

export interface ChatResult {
  content: string;
  model: string;
  finishReason: string | null;
  usage: { promptTokens?: number; completionTokens?: number } | null;
}

interface RawResponse {
  model?: string;
  choices?: { message?: { content?: string | null }; finish_reason?: string | null }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

export async function chatCompletion(params: {
  model: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}): Promise<ChatResult> {
  const { apiKey } = getHuggingFaceConfig();

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        max_tokens: params.maxTokens ?? 4096,
        temperature: params.temperature ?? 0,
        stream: false,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    console.error("[huggingface] request failed:", timedOut ? "timeout" : (error as Error).message);
    throw errors.badGateway(
      timedOut ? "Reading the menu took too long. Please try again." : "We couldn't reach the menu reader. Please try again.",
    );
  }

  if (!response.ok) {
    // Log the status and a short, key-free excerpt for debugging; never forward it to the client.
    const excerpt = (await response.text().catch(() => "")).slice(0, 300);
    console.error(`[huggingface] ${params.model} → HTTP ${response.status}: ${excerpt}`);
    if (response.status === 401 || response.status === 403) throw errors.serviceUnavailable();
    if (response.status === 429) throw errors.serviceUnavailable("The menu reader is busy right now. Please try again in a minute.");
    throw errors.badGateway();
  }

  const data = (await response.json().catch(() => null)) as RawResponse | null;
  const choice = data?.choices?.[0];
  if (!choice || typeof choice.message?.content !== "string") {
    console.error("[huggingface] unexpected response shape");
    throw errors.badGateway();
  }

  return {
    content: choice.message.content,
    model: data?.model ?? params.model,
    finishReason: choice.finish_reason ?? null,
    usage: data?.usage
      ? { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens }
      : null,
  };
}
