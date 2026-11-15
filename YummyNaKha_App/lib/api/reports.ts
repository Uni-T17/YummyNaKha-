import { apiFetch } from "./client";

export type DishProblem = "name" | "ingredients" | "price" | "other";

export interface DishReportInput {
  analysisId?: string;
  dishThai: string;
  dishEn: string;
  problem: DishProblem;
  note?: string;
}

/** "Report a problem" on a dish — read by the team to fix the Thai dish guide. */
export async function reportDish(input: DishReportInput) {
  await apiFetch<{ ok: true }>("/api/reports", { body: input });
}
