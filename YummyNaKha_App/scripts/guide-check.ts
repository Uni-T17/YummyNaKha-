// Checks the Thai dish guide data: duplicate ids, a Thai spelling used by two
// dishes (the second could never match), and ingredients nothing uses.
// Optionally reads a text file of menu lines and reports how they are matched.
//
//   npm run guide:check                       # data checks only
//   npm run guide:check -- scripts/menu-lines.txt

import { readFileSync } from "node:fs";
import { DISHES, GUIDE_VERSION } from "@/lib/server/thai-food/dishes";
import { INGREDIENTS } from "@/lib/server/thai-food/ingredients";
import { foldOcrConfusions, matchMenuLine, normalizeThai } from "@/lib/server/thai-food/match";
import { VARIANTS } from "@/lib/server/thai-food/variants";
import { WORDS } from "@/lib/server/thai-food/words";

const problems: string[] = [];

const ids = new Set<string>();
const spellings = new Map<string, string>();
for (const dish of DISHES) {
  if (ids.has(dish.id)) problems.push(`duplicate dish id: ${dish.id}`);
  ids.add(dish.id);
  for (const th of dish.th) {
    const key = normalizeThai(th);
    const owner = spellings.get(key);
    if (owner && owner !== dish.id) problems.push(`"${th}" is used by both ${owner} and ${dish.id}`);
    spellings.set(key, dish.id);
  }
}

// Spellings that only differ by OCR look-alike letters can be confused on a blurry photo.
const folded = new Map<string, string>();
const lookAlikes: string[] = [];
for (const dish of DISHES) {
  for (const th of dish.th) {
    const key = foldOcrConfusions(normalizeThai(th));
    const owner = folded.get(key);
    if (owner && owner !== dish.id) lookAlikes.push(`${owner} / ${dish.id} ("${th}")`);
    folded.set(key, dish.id);
  }
}

const used = new Set<string>([
  ...DISHES.flatMap((d) => d.ingredients.map((i) => i.key)),
  ...[...VARIANTS, ...WORDS].flatMap((w) => [...w.ingredients, ...(w.mayContain ?? [])]),
]);
const unused = Object.keys(INGREDIENTS).filter((k) => !used.has(k));

console.log(`Thai dish guide ${GUIDE_VERSION}`);
console.log(`  ${DISHES.length} dishes · ${spellings.size} Thai spellings · ${VARIANTS.length} proteins/styles · ${WORDS.length} menu words · ${Object.keys(INGREDIENTS).length} ingredients`);
if (unused.length > 0) console.log(`  unused ingredients: ${unused.join(", ")}`);
if (lookAlikes.length > 0) console.log(`  look-alike spellings (OCR could confuse them): ${lookAlikes.join(" · ")}`);

const file = process.argv[2];
if (file) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
  const counts = { exact: 0, fuzzy: 0, decoded: 0, none: 0 };
  const missed: string[] = [];
  for (const line of lines) {
    const m = matchMenuLine(line);
    counts[m.quality]++;
    if (m.quality === "none") missed.push(line);
  }
  const pct = (n: number) => `${Math.round((n / lines.length) * 100)}%`;
  console.log(`\n${lines.length} menu lines from ${file}`);
  console.log(`  in the guide: ${counts.exact + counts.fuzzy} (${pct(counts.exact + counts.fuzzy)})`);
  console.log(`  read from the dish name: ${counts.decoded} (${pct(counts.decoded)})`);
  console.log(`  not recognised: ${counts.none} (${pct(counts.none)})`);
  if (missed.length > 0) console.log(`  → ${missed.join(" · ")}`);
}

if (problems.length > 0) {
  console.error(`\n${problems.length} problem(s):\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
