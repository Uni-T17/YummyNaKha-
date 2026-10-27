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
  /** Thai name, so the diner can point at it when asking staff. */
  labelThai?: string;
  /** Avoid-list words this ingredient belongs to ("shellfish" for oyster sauce). */
  groups?: string[];
}

/** A dish as extracted + translated from the uploaded menu (before matching). */
export interface ExtractedDish {
  id: string;
  nameThai: string;
  nameEn: string;
  /** The name as printed on an English menu, when it differs from nameEn ("Pad Kra Pao Gai"). */
  nameOnMenu?: string;
  /** null when no price is printed for the dish (never guessed). */
  price: number | null;
  /** Lower-case keywords used to match the user's Favs (flavours, bases, proteins). */
  tags: string[];
  ingredients: InferredIngredient[];
  icon: DishIconKey;
  iconBg: string;
  iconColor: string;
  /** From the Thai dish guide; absent for dishes the guide doesn't know. */
  romanized?: string;
  description?: string;
  /** 0 = not spicy … 3 = very spicy (standard recipe). */
  spice?: 0 | 1 | 2 | 3;
  /** false when the dish isn't in our Thai dish guide, so its ingredients are unknown. */
  inGuide?: boolean;
  /** Reasons the result is uncertain; any of these keeps a dish out of Top Picks (F10). */
  uncertainties?: string[];
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
  /** Server image id once uploaded; a temporary client id while uploading. */
  id: string;
  fileName: string;
  status: "uploading" | "ready" | "error";
  /** User-facing reason when status is "error". */
  error?: string;
  /** Object URL for the picked file (this browser session only). */
  previewUrl?: string;
}
