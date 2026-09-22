import "server-only";
import { z } from "zod";
import { normalizeTerm } from "@/lib/matching";
import type { DishIconKey, ExtractedDish } from "@/lib/types";
import { errors, HttpError } from "../http";
import { generateJson } from "../gemini/client";
import { buildGeminiPrompt, type PreferenceFlags } from "./build-gemini-prompt";

// Sends menu text + preference flags to Gemini, validates the structured
// answer, and maps it to the ExtractedDish shape the frontend already renders.
// Gemini only infers dishes and ingredients; Top Pick / Check First / Avoid is
// decided by the deterministic rules in lib/matching.ts.

const text = (max: number) => z.string().trim().min(1).max(max);

const geminiDishSchema = z.object({
  nameThai: text(120),
  nameEn: text(120),
  price: z.number().nonnegative().max(100_000).nullable(),
  tags: z.array(z.string().trim().toLowerCase().max(30)).max(20).default([]),
  ingredients: z
    .array(
      z.object({
        name: text(40),
        certainty: z.enum(["listed", "common"]),
        note: z.string().trim().max(200).nullish(),
      }),
    )
    .max(30)
    .default([]),
  confidence: z.number().min(0).max(1),
});

const geminiResultSchema = z.object({
  unreadable: z.boolean(),
  summary: z.string().trim().max(300).default(""),
  dishes: z.array(z.unknown()).max(200),
});

export interface AnalyzedMenu {
  dishes: ExtractedDish[];
  summary: string;
  model: string;
  /** Dishes Gemini returned that failed validation or weren't found in the OCR text. */
  discarded: number;
  confidence: Record<string, number>;
}

const ICON_STYLES: Record<DishIconKey, { bg: string; color: string }> = {
  flame: { bg: "#FFF7ED", color: "#EA580C" },
  pot: { bg: "#FFFBEB", color: "#D97706" },
  beef: { bg: "#FFF1F2", color: "#E11D48" },
  soup: { bg: "#F0FDF4", color: "#16A34A" },
  fish: { bg: "#FDF4FF", color: "#9333EA" },
  leaf: { bg: "#FFFBEB", color: "#65A30D" },
};

function pickIcon(tags: string[], ingredients: string[]): DishIconKey {
  const has = (...words: string[]) => words.some((w) => tags.includes(w) || ingredients.includes(w));
  if (has("soup", "curry", "tom yum")) return "soup";
  if (has("seafood", "fish", "shrimp", "prawn", "squid", "crab", "shellfish")) return "fish";
  if (has("spicy", "chili")) return "flame";
  if (has("pork", "beef", "duck", "lamb")) return "beef";
  if (has("veggie", "vegetable", "tofu", "mushroom", "salad")) return "leaf";
  return "pot";
}

const squash = (s: string) => s.replace(/\s+/g, "");

export async function analyzeMenuText(input: {
  analysisId: string;
  thaiText: string;
  englishText: string;
  preferences: PreferenceFlags;
}): Promise<AnalyzedMenu> {
  const prompt = buildGeminiPrompt(input);
  const response = await generateJson({ ...prompt, temperature: 0.2 });

  const parsed = geminiResultSchema.safeParse(response.data);
  if (!parsed.success) {
    console.error("[gemini] result failed validation:", parsed.error.issues.slice(0, 3));
    throw errors.badGateway("The menu analysis came back in an unexpected format. Please try again.");
  }

  const source = squash(input.thaiText);
  const dishes: ExtractedDish[] = [];
  const confidence: Record<string, number> = {};
  let discarded = 0;

  for (const candidate of parsed.data.dishes) {
    const dish = geminiDishSchema.safeParse(candidate);
    // Drop malformed dishes and any dish whose Thai name isn't in the OCR text (not invented).
    if (!dish.success || !source.includes(squash(dish.data.nameThai))) {
      discarded++;
      continue;
    }
    const d = dish.data;
    const id = `${input.analysisId}-${dishes.length + 1}`;
    const ingredients = d.ingredients.map((ing) => ({
      key: normalizeTerm(ing.name),
      label: ing.name.toLowerCase(),
      certainty: ing.certainty,
      ...(ing.note ? { note: ing.note } : {}),
    }));
    const tags = Array.from(new Set([...d.tags, ...ingredients.filter((i) => i.certainty === "listed").map((i) => i.key)]));
    const icon = pickIcon(tags, ingredients.map((i) => i.key));

    dishes.push({
      id,
      nameThai: d.nameThai,
      nameEn: d.nameEn,
      price: d.price,
      tags,
      ingredients,
      icon,
      iconBg: ICON_STYLES[icon].bg,
      iconColor: ICON_STYLES[icon].color,
    });
    confidence[id] = d.confidence;
  }

  if (dishes.length === 0) {
    throw new HttpError(422, "AI_UNREADABLE", "We couldn't find any dishes in this menu. Try a clearer photo of the dish list.");
  }

  return { dishes, summary: parsed.data.summary, model: response.model, discarded, confidence };
}
