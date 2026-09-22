import type {
  AvoidItem,
  Dish,
  DishConflict,
  DishStatus,
  ExtractedDish,
  TasteProfile,
} from "./types";

// Client-side stand-in for the recommendation step. Mirrors the rules in
// rule.md: three categories only, no scores, and an allergy / doctor-advised
// item that is part of the dish always lands in "avoid".

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

function conflictFor(dish: ExtractedDish, item: AvoidItem): { conflict: DishConflict; severe: boolean } | null {
  const hit = dish.ingredients.find((ing) => termsMatch(ing.key, item.name));
  if (!hit) return null;

  const note =
    hit.certainty === "common"
      ? `${hit.note ?? `${capitalize(hit.label)} may be added to this dish.`} Please confirm with restaurant staff before ordering.`
      : `This dish contains ${hit.label}, which is in your Avoid list.`;

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

  const status: DishStatus = found.some((c) => c.severe)
    ? "avoid"
    : found.length > 0
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
