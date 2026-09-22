import type { ExtractedDish, MenuUpload } from "../types";
import { ApiError, apiFetch } from "./client";

// Menu photos and analysis. Uploading stores the photo on our server; the
// analysis (Hugging Face OCR + translation → Gemini) runs entirely server-side.

export const ANALYSIS_STEPS = [
  "Reading your Thai menu",
  "Finding dishes & prices",
  "Translating to English",
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
const inFlight = new Map<string, Promise<ExtractedDish[]>>();

export function analyzeMenu(uploads: MenuUpload[]): Promise<ExtractedDish[]> {
  const imageIds = uploads.filter((u) => u.status === "ready").map((u) => u.id);
  if (imageIds.length === 0) return Promise.reject(new ApiError("Add at least one menu image first."));

  const key = imageIds.join(",");
  const running = inFlight.get(key);
  if (running) return running;

  const request = apiFetch<{ dishes: ExtractedDish[] }>("/api/ai/analyze", { body: { imageIds } })
    .then((r) => r.dishes)
    .finally(() => inFlight.delete(key));
  inFlight.set(key, request);
  return request;
}
