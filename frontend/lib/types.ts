// Domain types shared by the UI, the mock data and the API layer.

export interface AppUser {
  id: string;
  name: string;
  email: string;
}

/** Why a food is on the Avoid list. `undefined` = the user skipped the question. */
export type AvoidReason = "dislike" | "allergy" | "doctor";

export interface AvoidItem {
  name: string;
  reason?: AvoidReason;
}

export interface TasteProfile {
  favs: string[];
  avoid: AvoidItem[];
}

/** The only three result categories the product may show (see rule.md). */
export type DishStatus = "top" | "check" | "avoid";

export type MenuFilter = "all" | DishStatus;

/** Keys for the illustrative dish icons (mapped to lucide icons in the UI). */
export type DishIconKey = "flame" | "pot" | "beef" | "soup" | "fish" | "leaf";

/**
 * An ingredient inferred for a dish.
 * - `listed`: part of the dish itself (e.g. pork in pork fried rice).
 * - `common`: often served with / added to the dish, but not certain.
 */
export interface InferredIngredient {
  key: string;
  label: string;
  certainty: "listed" | "common";
  /** Optional context shown for `common` ingredients. */
  note?: string;
}

/** A dish as extracted + translated from the uploaded menu (before matching). */
export interface ExtractedDish {
  id: string;
  nameThai: string;
  nameEn: string;
  price: number;
  /** Lower-case keywords used to match the user's Favs (flavours, bases, proteins). */
  tags: string[];
  ingredients: InferredIngredient[];
  icon: DishIconKey;
  iconBg: string;
  iconColor: string;
}

export interface DishConflict {
  name: string;
  reason?: AvoidReason;
  note: string;
}

/** A dish after it has been checked against the user's profile. */
export interface Dish extends ExtractedDish {
  status: DishStatus;
  favMatches: string[];
  conflicts: DishConflict[];
}

export interface MenuUpload {
  id: string;
  fileName: string;
  /** Object URL for a real file picked by the user; absent for sample uploads. */
  previewUrl?: string;
}
