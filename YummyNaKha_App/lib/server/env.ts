import "server-only";
import { z } from "zod";
import { HttpError } from "./http";

// Server-side configuration. Read lazily so a missing value only breaks the
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

export const DEFAULT_OCR_SERVICE_URL = "http://127.0.0.1:8765";

/** Our own OCR service (ocr-service/). Runs next to the app; no API key, no third party. */
export function getOcrServiceUrl(): string {
  return (process.env.OCR_SERVICE_URL?.trim() || DEFAULT_OCR_SERVICE_URL).replace(/\/+$/, "");
}

/** Google sign-in (OAuth client from Google Cloud Console → APIs & Services → Credentials). */
export function getGoogleOAuth() {
  return {
    clientId: read(z.string().min(10), process.env.GOOGLE_CLIENT_ID?.trim(), "GOOGLE_CLIENT_ID"),
    clientSecret: read(z.string().min(10), process.env.GOOGLE_CLIENT_SECRET?.trim(), "GOOGLE_CLIENT_SECRET"),
  };
}

/**
 * The public address of the app (e.g. https://yummynakha.example). Used for
 * the Google redirect URL, which must match the one registered with Google
 * exactly. Falls back to the request's own origin (fine for localhost).
 */
export function getAppUrl(request: Request): string {
  const configured = process.env.APP_URL?.trim();
  return (configured || new URL(request.url).origin).replace(/\/+$/, "");
}

/**
 * Google Gemini, used only for the optional menu helper (pairing dishes with a
 * menu's meat list). null when no key is set — the app then works without it.
 */
export function getGeminiConfig(): { apiKey: string; models: string[] } | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  const models = [process.env.GEMINI_MODEL, ...(process.env.GEMINI_FALLBACK_MODELS ?? "").split(",")]
    .map((m) => m?.trim())
    .filter((m): m is string => !!m);
  return { apiKey, models: models.length > 0 ? Array.from(new Set(models)) : ["gemini-2.5-flash"] };
}
