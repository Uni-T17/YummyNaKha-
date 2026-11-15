import "server-only";
import { z } from "zod";
import { generateJson } from "./gemini";
import type { MeatPair, findMeatMenu } from "../menu/build-dishes";

// Optional menu helper (with the user's "ai-transfer" consent): on a
// made-to-order menu, Google Gemini decides which listed dishes can be ordered
// with which of the menu's meats. Gemini only answers with line numbers. It
// never writes a dish name, price or ingredient: every combo's price comes from
// the menu and its ingredients from our Thai dish guide. Only the menu text is
// sent — no photo, account or food profile (rule.md: minimum fields).

/** The helper is a nice-to-have: all models together get this long, then "choose your meat" is shown. */
const BUDGET_MS = 8_000;
const MAX_LINES = 60;

const INSTRUCTION = `You read a Thai restaurant menu. It lists DISHES without their meat and, separately, MEATS with prices: the customer orders a dish with one meat and pays that meat's price.
For each dish, list every meat it can be ordered with. Most dishes take every meat. Leave out a pair only when the dish name makes it impossible (for example a dish that already names a meat or is vegetarian).
Answer only with line numbers from the lists. Never add, rename or translate anything.`;

const answerSchema = z.object({
  pairs: z.array(z.object({ dish: z.number().int(), meat: z.number().int() })).max(MAX_LINES * MAX_LINES),
});

export interface PairingResult {
  pairs: MeatPair[];
  model: string;
}

/** Pairs, or null on any problem (no key, timeout, busy, unexpected answer) — the caller falls back. */
export async function pairDishesWithMeats(menu: NonNullable<ReturnType<typeof findMeatMenu>>): Promise<PairingResult | null> {
  const dishes = menu.dishes.slice(0, MAX_LINES);
  const meats = menu.meats.slice(0, MAX_LINES);
  const text = [
    "DISHES:",
    ...dishes.map((d, i) => `${i + 1}. ${d.name}${d.price !== null ? ` (${d.price})` : ""}`),
    "MEATS:",
    ...meats.map((m, i) => `${i + 1}. ${m.name} (${m.price})`),
  ].join("\n");

  const result = await generateJson({
    instruction: INSTRUCTION,
    text,
    schema: answerSchema,
    budgetMs: BUDGET_MS,
    responseSchema: {
      type: "OBJECT",
      properties: {
        pairs: {
          type: "ARRAY",
          items: { type: "OBJECT", properties: { dish: { type: "INTEGER" }, meat: { type: "INTEGER" } }, required: ["dish", "meat"] },
        },
      },
      required: ["pairs"],
    },
  });
  if (!result) return null;

  // Keep only real line numbers, each pair once.
  const seen = new Set<string>();
  const pairs = result.data.pairs
    .filter((p) => p.dish >= 1 && p.dish <= dishes.length && p.meat >= 1 && p.meat <= meats.length)
    .filter((p) => !seen.has(`${p.dish}:${p.meat}`) && seen.add(`${p.dish}:${p.meat}`))
    .sort((a, b) => a.dish - b.dish || a.meat - b.meat)
    .map((p) => ({ dish: dishes[p.dish - 1], meat: meats[p.meat - 1] }));
  return pairs.length > 0 ? { pairs, model: result.model } : null;
}
