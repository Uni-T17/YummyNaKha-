import "server-only";
import type { ExtractedDish } from "@/lib/types";
import { prisma } from "../db";
import { normalizeThai } from "../thai-food/match";

// Counts menu lines that matched no guide dish, so the team adds the most
// common ones first (`npm run guide:coverage`). Only the dish text is stored —
// no user, scan or photo — so the count survives account deletion without
// keeping anyone's data.

/** Shortest normalized name worth counting; shorter lines are OCR noise. */
const MIN_KEY_LENGTH = 3;

export async function countUnlistedDishes(dishes: ExtractedDish[]): Promise<void> {
  const byKey = new Map<string, string>();
  for (const dish of dishes) {
    if (dish.inGuide !== false) continue;
    const key = normalizeThai(dish.nameThai);
    if (key.length >= MIN_KEY_LENGTH) byKey.set(key, dish.nameThai);
  }
  if (byKey.size === 0) return;

  try {
    await prisma.$transaction(
      [...byKey].map(([key, nameThai]) =>
        prisma.unlistedDish.upsert({
          where: { key },
          create: { key, nameThai },
          update: { nameThai, timesSeen: { increment: 1 } },
        }),
      ),
    );
  } catch (error) {
    // Bookkeeping only: never fail a diner's scan because of it.
    console.warn("[guide] could not count unlisted dishes:", (error as Error).message);
  }
}
