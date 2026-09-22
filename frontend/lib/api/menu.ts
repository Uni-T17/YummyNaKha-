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

export async function analyzeMenu(uploads: MenuUpload[]): Promise<ExtractedDish[]> {
  const imageIds = uploads.filter((u) => u.status === "ready").map((u) => u.id);
  if (imageIds.length === 0) throw new ApiError("Add at least one menu image first.");
  const { dishes } = await apiFetch<{ dishes: ExtractedDish[] }>("/api/ai/analyze", { body: { imageIds } });
  return dishes;
}
