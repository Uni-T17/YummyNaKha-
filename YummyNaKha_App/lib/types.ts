// Domain types shared by the UI, the mock data and the API layer.

export interface AppUser {
  id: string;
  name: string;
  email: string;
  /** false for an account that only signs in with Google. */
  hasPassword?: boolean;
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

/**
 * One option from a menu's "pick your meat" list (เนื้อสัตว์: หมูชิ้น 50, กุ้ง 60 …),
 * offered for every dish on that menu that needs a meat.
 */
export interface DishChoice {
  name: string;
  nameThai: string;
  price: number | null;
  ingredients: InferredIngredient[];
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
  /** The price is the cheapest meat choice ("from ฿50"), not a fixed price. */
  priceFrom?: boolean;
  /** The menu's meat list, when the diner picks one for this dish. Not in `ingredients`. */
  choices?: DishChoice[];
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
  /**
   * For a dish not in our guide, Gemini's guess (optional Menu helper, filled in
   * after the scan). Its ingredients are added to `ingredients` as "often added"
   * only, so a guess can add a warning but never makes a dish look safer.
   */
  aiGuess?: { nameEn: string; description: string; model: string };
  /** Reasons the result is uncertain; any of these keeps a dish out of Top Picks (F10). */
  uncertainties?: string[];
}

export interface DishConflict {
  name: string;
  reason?: AvoidReason;
  note: string;
}

/** A dish after it has been checked against the user's profile. */
/** A meat choice checked against the diner's Avoid list. */
export interface ChoiceResult extends DishChoice {
  /** Avoid-list items this choice contains; empty = no conflict detected. */
  avoid: string[];
}

export interface Dish extends ExtractedDish {
  status: DishStatus;
  favMatches: string[];
  conflicts: DishConflict[];
  /** Each meat choice checked against the Avoid list (same order as `choices`). */
  choiceResults?: ChoiceResult[];
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
