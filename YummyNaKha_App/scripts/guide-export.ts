// Exports the Thai dish guide as a CSV (one row per dish), in a layout close
// to public Thai dish lists so it can be shared and reviewed in a spreadsheet.
// The TypeScript files stay the source of truth; re-run after any change.
//
//   npm run guide:export                    # writes data/thai-dish-guide.csv
//   npm run guide:export -- other/path.csv

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { DISHES, GUIDE_VERSION } from "@/lib/server/thai-food/dishes";
import { INGREDIENTS } from "@/lib/server/thai-food/ingredients";

const out = process.argv[2] ?? "data/thai-dish-guide.csv";

const cell = (value: string | number | boolean) => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const header = [
  "id", "en_name", "th_name", "th_spellings", "romanized", "course", "spice_0_3", "description",
  "ingredients_listed", "ingredients_often_added", "ingredients_th", "avoid_list_groups", "needs_protein", "guide_version",
];

const rows = DISHES.map((dish) => {
  const listed = dish.ingredients.filter((i) => i.certainty === "listed").map((i) => i.key);
  const often = dish.ingredients.filter((i) => i.certainty === "common").map((i) => i.key);
  const groups = [...new Set(dish.ingredients.flatMap((i) => INGREDIENTS[i.key].groups))].sort();
  return [
    dish.id, dish.en, dish.th[0], dish.th.join("|"), dish.romanized, dish.category, dish.spice, dish.description,
    listed.join("+"), often.join("+"), dish.ingredients.map((i) => INGREDIENTS[i.key].th).join("+"),
    groups.join("+"), Boolean(dish.needsProtein), GUIDE_VERSION,
  ];
});

mkdirSync(dirname(out), { recursive: true });
// BOM so Excel opens the Thai text as UTF-8.
writeFileSync(out, "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\n") + "\n");
console.log(`Wrote ${rows.length} dishes (guide ${GUIDE_VERSION}) to ${out}`);
