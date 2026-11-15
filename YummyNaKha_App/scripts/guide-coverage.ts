// Which dishes on real scanned menus are missing from the Thai dish guide, and
// what have diners reported as wrong? Reads the saved menu analyses, the
// anonymous unlisted-dish counter and the "Report a problem" reports — the
// next guide entries worth adding or fixing.
//
//   npm run guide:coverage            # all analyses
//   npm run guide:coverage -- 30      # only the last 30 days

import "dotenv/config";
import { prisma } from "@/lib/server/db";
import type { ExtractedDish } from "@/lib/types";

async function main() {
  const days = Number(process.argv[2]) || null;

  const analyses = await prisma.menuAnalysis.findMany({
    where: { status: "PROCESSED", ...(days ? { createdAt: { gte: new Date(Date.now() - days * 86_400_000) } } : {}) },
    select: { result: true },
  });

  let total = 0;
  let inGuide = 0;
  const missing = new Map<string, { count: number; nameEn: string }>();
  for (const { result } of analyses) {
    const dishes = ((result as { dishes?: ExtractedDish[] } | null)?.dishes ?? []).filter((d) => d.inGuide !== undefined);
    for (const dish of dishes) {
      total++;
      if (dish.inGuide) {
        inGuide++;
        continue;
      }
      const entry = missing.get(dish.nameThai) ?? { count: 0, nameEn: dish.nameEn };
      entry.count++;
      missing.set(dish.nameThai, entry);
    }
  }

  if (total === 0) {
    console.log("No analysed dishes yet (only scans made with the Thai dish guide are counted).");
  } else {
    console.log(`${analyses.length} menus · ${total} dishes · ${Math.round((inGuide / total) * 100)}% in the guide\n`);
    console.log("Missing from the guide (most frequent first):");
    for (const [th, { count, nameEn }] of [...missing].sort((a, b) => b[1].count - a[1].count).slice(0, 50)) {
      console.log(`  ${String(count).padStart(3)} × ${th}  — ${nameEn}`);
    }
  }

  // The anonymous counter keeps counting after scans and accounts are deleted.
  const counted = await prisma.unlistedDish.findMany({ orderBy: { timesSeen: "desc" }, take: 50 });
  if (counted.length > 0) {
    console.log("\nAll-time counter of dishes not in the guide (no user data):");
    for (const d of counted) console.log(`  ${String(d.timesSeen).padStart(3)} × ${d.nameThai}  (last seen ${d.lastSeenAt.toISOString().slice(0, 10)})`);
  }

  const reports = await prisma.dishReport.findMany({
    where: days ? { createdAt: { gte: new Date(Date.now() - days * 86_400_000) } } : {},
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { createdAt: true, problem: true, dishThai: true, dishEn: true, note: true, guideVersion: true },
  });
  if (reports.length > 0) {
    console.log(`\nDiner reports (${reports.length}, newest first):`);
    for (const r of reports) {
      const note = r.note ? ` — “${r.note}”` : "";
      console.log(`  ${r.createdAt.toISOString().slice(0, 10)}  ${r.problem.padEnd(11)} ${r.dishThai} / ${r.dishEn} [${r.guideVersion}]${note}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
