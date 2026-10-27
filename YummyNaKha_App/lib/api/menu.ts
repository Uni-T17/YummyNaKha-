import type { ExtractedDish, MenuUpload } from "../types";
import { ApiError, apiFetch } from "./client";

// Menu photos and analysis. Uploading stores the photo on our server; the
// analysis (our OCR service → Thai dish guide) runs entirely on our server.

export const ANALYSIS_STEPS = [
  "Reading your Thai menu",
  "Finding dishes & prices",
  "Looking up ingredients",
  "Checking your Favs",
  "Checking your Avoid list",
  "Finding your best picks",
] as const;

export async function uploadMenuImage(file: File): Promise<{ id: string; fileName: string }> {
  const form = new FormData();
  form.append("file", file);
  const { image } = await apiFetch<{ image: { id: string; fileName: string } }>("/api/images", { body: form });
  return image;
}

export function deleteMenuImage(id: string): Promise<void> {
  return apiFetch<void>(`/api/images/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// One in-flight analysis per set of photos, so a re-mounted screen (React
// Strict Mode, fast navigation) reuses the running request instead of racing it.
export interface AnalyzedMenu {
  analysisId: string;
  dishes: ExtractedDish[];
}

const inFlight = new Map<string, Promise<AnalyzedMenu>>();

export function analyzeMenu(uploads: MenuUpload[]): Promise<AnalyzedMenu> {
  const imageIds = uploads.filter((u) => u.status === "ready").map((u) => u.id);
  if (imageIds.length === 0) return Promise.reject(new ApiError("Add at least one menu image first."));

  const key = imageIds.join(",");
  const running = inFlight.get(key);
  if (running) return running;

  const request = apiFetch<AnalyzedMenu>("/api/ai/analyze", { body: { imageIds } })
    .then((r) => ({ analysisId: r.analysisId, dishes: r.dishes }))
    .finally(() => inFlight.delete(key));
  inFlight.set(key, request);
  return request;
}

/**
 * Asks the optional Menu helper (Gemini) about dishes that aren't in our guide.
 * "off" = the helper isn't turned on; "unavailable" = no answer this time.
 */
export async function describeUnlisted(analysisId: string): Promise<{ dishes: ExtractedDish[] } | "off" | "unavailable"> {
  try {
    const r = await apiFetch<{ dishes: ExtractedDish[]; available: boolean }>("/api/ai/describe", { body: { analysisId } });
    return r.available ? { dishes: r.dishes } : "unavailable";
  } catch (e) {
    if (e instanceof ApiError && e.code === "CONSENT_REQUIRED") return "off";
    return "unavailable";
  }
}
