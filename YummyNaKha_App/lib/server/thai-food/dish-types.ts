import "server-only";
import type { IngredientKey } from "./ingredients";

// Shared shape of Thai dish guide entries (dishes.ts, dishes-more.ts).

export type DishCategory =
  | "stir-fry"
  | "curry"
  | "soup"
  | "noodles"
  | "rice"
  | "salad"
  | "grilled"
  | "fried"
  | "steamed"
  | "dessert"
  | "drink";

export interface GuideIngredient {
  key: IngredientKey;
  certainty: "listed" | "common";
  note?: string;
}

export interface GuideDish {
  id: string;
  th: string[];
  en: string;
  /** Thai name in Latin letters, as diners often see it abroad. */
  romanized: string;
  category: DishCategory;
  /** 0 = not spicy … 3 = very spicy, for the standard recipe. */
  spice: 0 | 1 | 2 | 3;
  description: string;
  ingredients: GuideIngredient[];
  /** The menu normally names the meat or seafood (ผัดกะเพรา + หมู); flag it when it doesn't. */
  needsProtein?: boolean;
  tags?: string[];
}

export const L = (key: IngredientKey, note?: string): GuideIngredient => ({ key, certainty: "listed", ...(note ? { note } : {}) });
export const C = (key: IngredientKey, note?: string): GuideIngredient => ({ key, certainty: "common", ...(note ? { note } : {}) });

export const PASTE_NOTE = "Thai curry pastes are usually made with shrimp paste.";
export const CONDIMENTS_NOTE = "Noodle shops put sugar, chili, vinegar, fish sauce and sometimes ground peanuts on the table.";
export const JAEW_NOTE = "Often served with jaew, a dipping sauce of chili, toasted rice, fish sauce and lime.";
