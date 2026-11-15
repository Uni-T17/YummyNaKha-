import "server-only";
import { z } from "zod";
import type { ExtractedDish } from "@/lib/types";
import { ingredient } from "../menu/build-dishes";
import { englishTokens, readEnglishWords } from "../thai-food/english";
import { INGREDIENTS, type IngredientKey } from "../thai-food/ingredients";
import { generateJson } from "./gemini";

// Optional Menu helper, part 2: for dishes that aren't in our Thai dish guide,
// Google Gemini guesses an English name, a short description and the usual
// ingredients — picked only from our own ingredient catalogue, so each guess
// carries our allergen groups (shrimp paste → shellfish). Only the dish names
// are sent. Guessed ingredients are added as "often added" with an AI note:
// they can add a warning, never remove one, and the dish stays Check First.

/** Runs after the menu is already on screen, so it may take longer than the pairing step. */
const BUDGET_MS = 20_000;
const MAX_DISHES = 25;
const KEYS = Object.keys(INGREDIENTS) as IngredientKey[];

const INSTRUCTION = `You help foreigners understand Thai restaurant menus. For each numbered menu line (a dish name, usually in Thai), give:
- en: a short English name for the dish
- description: one plain sentence describing what it usually is
- ingredients: the ingredients this dish usually contains, written exactly as in the ALLOWED INGREDIENTS list (anything else is ignored). Include the sauces, pastes and seasonings it is usually made with (fish sauce, shrimp paste, oyster sauce, soy sauce, peanut, egg …), because they matter for allergies.
If a line is not a dish, or you don't know it, leave it out. Never say a dish is safe, and never mention health or allergies.`;

const answerSchema = z.object({
  dishes: z
    .array(
      z.object({
        line: z.number().int(),
        en: z.string().trim().min(1).max(80),
        description: z.string().trim().min(1).max(240),
        ingredients: z.array(z.string()).max(30),
      }),
    )
    .max(MAX_DISHES),
});

const AI_NOTE = "AI guess (Google Gemini) — not from our dish guide.";

/** The unlisted dishes with Gemini's guess merged in; null when Gemini isn't available or didn't answer. */
export async function describeUnlisted(dishes: ExtractedDish[]): Promise<{ dishes: ExtractedDish[]; model: string } | null> {
  const unlisted = dishes.filter((d) => d.inGuide === false && !d.aiGuess).slice(0, MAX_DISHES);
  if (unlisted.length === 0) return { dishes: [], model: "" };

  const result = await generateJson({
    instruction: INSTRUCTION,
    text: [
      `ALLOWED INGREDIENTS: ${KEYS.join(", ")}`,
      "MENU LINES:",
      ...unlisted.map((d, i) => `${i + 1}. ${d.nameOnMenu ?? d.nameThai}`),
    ].join("\n"),
    schema: answerSchema,
    budgetMs: BUDGET_MS,
    responseSchema: {
      type: "OBJECT",
      properties: {
        dishes: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              line: { type: "INTEGER" },
              en: { type: "STRING" },
              description: { type: "STRING" },
              // Gemini rejects a 160-value enum here, so the list is in the prompt and checked below.
              ingredients: { type: "ARRAY", items: { type: "STRING" } },
            },
            required: ["line", "en", "description", "ingredients"],
          },
        },
      },
      required: ["dishes"],
    },
  });
  if (!result) return null;

  const updated: ExtractedDish[] = [];
  for (const guess of result.data.dishes) {
    const dish = unlisted[guess.line - 1];
    if (!dish || updated.includes(dish)) continue;
    const known = new Set(dish.ingredients.map((i) => i.key));
    // Only names from our own catalogue count: they carry our allergen groups.
    // Ingredients the AI mentions in its own description count too — its list
    // can leave out what the sentence names ("wrapped in bean curd skin" → tofu).
    const named = guess.ingredients
      .map((name) => name.trim().toLowerCase())
      .filter((name): name is IngredientKey => (KEYS as string[]).includes(name));
    const described = readEnglishWords(englishTokens(`${guess.en} ${guess.description}`)).words.flatMap((w) => [
      ...w.ingredients,
      ...(w.mayContain ?? []),
    ]);
    const added = [...named, ...described]
      .map((key) => ingredient(key, "common", AI_NOTE))
      .filter((ing) => !known.has(ing.key) && known.add(ing.key));
    updated.push({
      ...dish,
      ingredients: [...dish.ingredients, ...added],
      aiGuess: { nameEn: guess.en, description: guess.description, model: result.model },
    });
  }
  return { dishes: updated, model: result.model };
}
