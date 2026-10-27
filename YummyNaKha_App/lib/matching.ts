import type {
  AvoidItem,
  Dish,
  DishConflict,
  DishStatus,
  ExtractedDish,
  InferredIngredient,
  TasteProfile,
} from "./types";

// The recommendation step. Mirrors the rules in rule.md: three categories
// only, no scores, an allergy / doctor-advised item that is part of the dish
// always lands in "avoid", uncertain information never reaches "top" (F10),
// and every check / avoid note points the diner to restaurant staff.

export const STATUS_ORDER: Record<DishStatus, number> = { top: 0, check: 1, avoid: 2 };

/** "Peanuts" → "peanut", "Noodles" → "noodle", "Mushroom" → "mushroom". */
export function normalizeTerm(term: string): string {
  const t = term.trim().toLowerCase();
  if (t.endsWith("s") && !t.endsWith("ss") && t.length > 3) return t.slice(0, -1);
  return t;
}

function termsMatch(a: string, b: string) {
  return normalizeTerm(a) === normalizeTerm(b);
}

const STAFF = "Please confirm with restaurant staff before ordering.";

/** An ingredient matches an Avoid item by its own name or a group it belongs to ("shellfish"). */
function ingredientMatches(ing: InferredIngredient, avoidName: string) {
  return termsMatch(ing.key, avoidName) || (ing.groups ?? []).some((g) => termsMatch(g, avoidName));
}

function conflictFor(dish: ExtractedDish, item: AvoidItem): { conflict: DishConflict; severe: boolean } | null {
  const hits = dish.ingredients.filter((ing) => ingredientMatches(ing, item.name));
  if (hits.length === 0) return null;
  // A listed ingredient outweighs one that is only sometimes added.
  const hit = hits.find((h) => h.certainty === "listed") ?? hits[0];
  const via = termsMatch(hit.key, item.name) ? "" : ` (${item.name.toLowerCase()})`;

  const note =
    hit.certainty === "common"
      ? `${hit.note ?? `${capitalize(hit.label)}${via} may be added to this dish.`} ${STAFF}`
      : `This dish usually contains ${hit.label}${via}, which is in your Avoid list. ${STAFF}`;

  const sensitive = item.reason === "allergy" || item.reason === "doctor";
  return {
    conflict: { name: item.name, reason: item.reason, note },
    severe: hit.certainty === "listed" && sensitive,
  };
}

export function categorizeDish(dish: ExtractedDish, profile: TasteProfile): Dish {
  const found = profile.avoid
    .map((item) => conflictFor(dish, item))
    .filter((c): c is NonNullable<typeof c> => c !== null);

  const uncertain = (dish.uncertainties?.length ?? 0) > 0 || dish.inGuide === false;
  const status: DishStatus = found.some((c) => c.severe)
    ? "avoid"
    : found.length > 0 || uncertain
      ? "check"
      : "top";

  const favMatches =
    status === "avoid" ? [] : profile.favs.filter((fav) => dish.tags.some((tag) => termsMatch(tag, fav)));

  return { ...dish, status, favMatches, conflicts: found.map((c) => c.conflict) };
}

export function categorizeMenu(menu: ExtractedDish[], profile: TasteProfile): Dish[] {
  return menu
    .map((dish) => categorizeDish(dish, profile))
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
