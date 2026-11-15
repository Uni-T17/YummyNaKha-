import "server-only";
import type { z } from "zod";
import { DishReportProblem } from "@/lib/generated/prisma/client";
import { prisma } from "../db";
import { errors } from "../http";
import { GUIDE_VERSION } from "../thai-food/dishes";
import type { dishReportSchema } from "../validation/reports";

const toDbProblem = {
  name: DishReportProblem.NAME,
  ingredients: DishReportProblem.INGREDIENTS,
  price: DishReportProblem.PRICE,
  other: DishReportProblem.OTHER,
} as const;

/** Saves a report with the guide version it was made against, for the team to review. */
export async function createDishReport(userId: string, input: z.infer<typeof dishReportSchema>) {
  if (input.analysisId) {
    const owned = await prisma.menuAnalysis.count({ where: { id: input.analysisId, userId } });
    if (owned === 0) throw errors.notFound("This menu scan wasn't found.");
  }
  await prisma.dishReport.create({
    data: {
      userId,
      analysisId: input.analysisId ?? null,
      dishThai: input.dishThai,
      dishEn: input.dishEn,
      problem: toDbProblem[input.problem],
      note: input.note ?? null,
      guideVersion: GUIDE_VERSION,
    },
  });
}
