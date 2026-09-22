import { SAMPLE_MENU } from "../mock-data";
import type { ExtractedDish, MenuUpload } from "../types";
import { ApiError, simulateLatency } from "./client";

// Mock menu analysis: extraction → translation → ingredient inference.
// Always returns the sample menu from the Figma prototype. Matching against the
// profile runs client-side (lib/matching.ts) so edits to My Taste re-sort the
// result instantly.
//
// TODO(api): POST the images to the backend analysis endpoint. Per rule.md
// (PDPA), send only the menu images and the relevant profile flags — never the
// account email or real name — and only after the user has consented to the
// third-party OCR/AI transfer.

export const ANALYSIS_STEPS = [
  "Reading your Thai menu",
  "Finding dishes & prices",
  "Translating to English",
  "Checking your Favs",
  "Checking your Avoid list",
  "Finding your best picks",
] as const;

export async function analyzeMenu(uploads: MenuUpload[]): Promise<ExtractedDish[]> {
  if (uploads.length === 0) throw new ApiError("Add at least one menu image first.");
  await simulateLatency(1200);
  return SAMPLE_MENU;
}
