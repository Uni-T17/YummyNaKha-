import { z } from "zod";

/** POST /api/reports — a diner's "this result is wrong" report on one dish. */
export const dishReportSchema = z.object({
  analysisId: z.string().trim().min(1).max(64).optional(),
  dishThai: z.string({ error: "Missing dish." }).trim().min(1, "Missing dish.").max(200),
  dishEn: z.string().trim().max(200).default(""),
  problem: z.enum(["name", "ingredients", "price", "other"], { error: "Choose what's wrong." }),
  note: z
    .string()
    .trim()
    .max(300, "Keep it under 300 characters.")
    .optional()
    .transform((v) => v || undefined),
});
