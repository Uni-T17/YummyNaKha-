import "server-only";
import { normalizeTerm } from "@/lib/matching";
import type { DishIconKey, ExtractedDish, InferredIngredient } from "@/lib/types";
import type { GuideDish } from "../thai-food/dishes";
import { INGREDIENTS, type IngredientKey } from "../thai-food/ingredients";
import { matchMenuLine, readWords } from "../thai-food/match";
import type { MenuWord } from "../thai-food/words";
import type { MenuItem } from "./parse-ocr";

// Menu items → the dishes the Menu screen renders. Ingredients come from the
// Thai dish guide; Top Pick / Check First / Avoid is decided later by the
// deterministic rules in lib/matching.ts.

const ICON_STYLES: Record<DishIconKey, { bg: string; color: string }> = {
  flame: { bg: "#FFF7ED", color: "#EA580C" },
  pot: { bg: "#FFFBEB", color: "#D97706" },
  beef: { bg: "#FFF1F2", color: "#E11D48" },
  soup: { bg: "#F0FDF4", color: "#16A34A" },
  fish: { bg: "#FDF4FF", color: "#9333EA" },
  leaf: { bg: "#FFFBEB", color: "#65A30D" },
};

function pickIcon(tags: string[]): DishIconKey {
  const has = (...words: string[]) => words.some((w) => tags.includes(w));
  if (has("soup", "curry")) return "soup";
  if (has("seafood", "fish", "shellfish")) return "fish";
  if (has("spicy")) return "flame";
  if (has("pork", "beef", "duck", "meat")) return "beef";
  if (has("veggie", "vegetable", "tofu", "salad")) return "leaf";
  return "pot";
}

function ingredient(key: IngredientKey, certainty: "listed" | "common", note?: string): InferredIngredient {
  const info = INGREDIENTS[key];
  return {
    key: normalizeTerm(key),
    label: key,
    labelThai: info.th,
    certainty,
    groups: info.groups,
    ...(note ? { note } : {}),
  };
}

/**
 * Proteins / styles offered as a choice: "ผัดพริกแกงหมู/ไก่", "น้ำข้น/น้ำใส".
 * The diner picks one, so none of them is certain to be in the dish.
 */
function choicesIn(thai: string): Set<MenuWord> {
  const segments = thai.split("/").map((part) => readWords(part).filter((w) => w.kind === "protein" || w.kind === "style"));
  if (segments.filter((words) => words.length > 0).length < 2) return new Set();
  return new Set(segments.flat());
}

/** Guide ingredients plus those named by the menu line; a listed entry beats a common one. */
function collectIngredients(dish: GuideDish | null, words: MenuWord[], choices: Set<MenuWord>, certain = true): InferredIngredient[] {
  const byKey = new Map<string, InferredIngredient>();
  const add = (ing: InferredIngredient) => {
    const existing = byKey.get(ing.key);
    if (!existing || (existing.certainty === "common" && ing.certainty === "listed")) byKey.set(ing.key, ing);
  };
  for (const w of words) {
    // A guide dish already knows how it is cooked; only what the menu adds to it counts.
    if (dish && (w.kind === "method" || w.kind === "dish")) continue;
    if (choices.has(w) || !certain) {
      const note = choices.has(w) ? `One of the choices on the menu (${w.en}).` : undefined;
      w.ingredients.forEach((k) => add(ingredient(k, "common", note)));
    } else {
      w.ingredients.forEach((k) => add(ingredient(k, "listed")));
    }
    w.mayContain?.forEach((k) => add(ingredient(k, "common")));
  }
  dish?.ingredients.forEach((i) => add(ingredient(i.key, i.certainty, i.note)));
  return [...byKey.values()].sort((a, b) => Number(a.certainty === "common") - Number(b.certainty === "common"));
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function englishName(dish: GuideDish | null, words: MenuWord[], choices: Set<MenuWord>) {
  // Only what the menu adds to the dish: "ไก่ผัดขิง" is not "Ginger Stir-fry with chicken, ginger".
  const inDish = new Set(dish?.ingredients.filter((i) => i.certainty === "listed").map((i) => i.key) ?? []);
  const of = (kind: MenuWord["kind"]) =>
    words.filter((w) => w.kind === kind && !(w.ingredients.length > 0 && w.ingredients.every((k) => inDish.has(k)))).map((w) => w.en);
  const join = (kind: MenuWord["kind"]) => {
    const list = words.filter((w) => w.kind === kind).map((w) => w.en);
    return list.length > 0 && words.some((w) => w.kind === kind && choices.has(w)) ? list.join(" or ") : list.join(" & ");
  };
  const proteins = of("protein").length > 0 ? join("protein") : "";
  const styles = words.some((w) => w.kind === "style" && choices.has(w)) ? [join("style")] : of("style");

  if (dish) {
    // "Pad Thai with shrimp", but "Noodles with Soy Sauce (pork)" rather than a second "with".
    const added = [proteins, ...of("ingredient"), ...of("flavor")].filter(Boolean).join(", ");
    let name = !added ? dish.en : dish.en.includes(" with ") ? `${dish.en} (${added})` : `${dish.en} with ${added}`;
    const base = of("base").filter((b) => !(dish.category === "rice" && b === "rice"))[0];
    if (base) name += base === "rice" || base === "sticky rice" ? ` on ${base}` : ` (${base})`;
    return styles.length > 0 ? `${name} (${styles.join(", ")})` : name;
  }

  // Read from the words: "Deep-fried squid with garlic", "Pork curry with bamboo shoots",
  // "Watermelon smoothie", "Stir-fried pork with basil on rice".
  const extras = [...of("ingredient"), ...of("flavor"), ...styles];
  const main = proteins || extras.shift() || "";
  const head = [of("method")[0], main, of("dish")[0]].filter(Boolean).join(" ");
  const base = of("base")[0];
  let name = head || "Dish";
  if (extras.length > 0) name += ` with ${extras.join(", ")}`;
  if (base) name += base === "rice" || base === "sticky rice" ? ` on ${base}` : ` (${base})`;
  return capitalize(name);
}

export function buildDishes(items: MenuItem[], analysisId: string): ExtractedDish[] {
  const dishes: ExtractedDish[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    // "(ราคาตามขนาดตัว)" — price by size — and other bracketed notes aren't part of the name.
    const { dish, words, quality, coverage } = matchMenuLine(item.thai.replace(/\([^)]*\)?/g, " "));
    // A heading or the restaurant name: nothing recognised, or only a loose match, and no price.
    if ((quality === "none" || quality === "fuzzy") && item.price === null) continue;
    // Just a meat ("หมูชิ้น", "ไก่สับ", "ทะเล +10") is a choice for the made-to-order dishes, not a dish.
    if (quality === "decoded" && words.every((w) => w.kind === "protein" || w.kind === "style")) continue;
    // Without a price, a decoded line must clearly name a dish, not a section ("เมนูทอด").
    const named = (kinds: MenuWord["kind"][]) => words.some((w) => kinds.includes(w.kind));
    if (quality === "decoded" && item.price === null && !(coverage >= 0.85 && named(["method", "dish"]) && named(["protein", "ingredient"]))) {
      continue;
    }

    const dedupeKey = `${item.thai}|${item.price}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const choices = choicesIn(item.thai);
    // Words on an unrecognised line still count for allergies, but only as "may contain".
    const ingredients = collectIngredients(dish, words, choices, quality !== "none");
    const uncertainties: string[] = [];
    if (quality === "decoded") {
      uncertainties.push(
        "This dish isn't in our Thai dish guide. We worked out its name and ingredients from the words on the menu, so sauces and other ingredients may be missing. Ask restaurant staff.",
      );
    } else if (!dish) {
      uncertainties.push("This dish isn't in our Thai dish guide yet, so we can't list its ingredients. Ask restaurant staff what's in it.");
    } else {
      if (quality === "fuzzy") {
        uncertainties.push(`We read this as “${dish.th[0]}” but may have misread the name. Check it with restaurant staff.`);
      }
      if (dish.needsProtein && !words.some((w) => w.kind === "protein")) {
        uncertainties.push("The menu doesn't say which meat or seafood is used. Ask restaurant staff.");
      }
    }

    // Tags drive Favs matching and the icon. Allergen groups count only for the
    // protein named on the menu: fish sauce shouldn't make every dish "seafood".
    const proteinGroups = words
      .filter((w) => w.kind === "protein")
      .flatMap((w) => w.ingredients.flatMap((k) => INGREDIENTS[k].groups));
    const tags = Array.from(
      new Set([
        ...(dish?.tags ?? []),
        ...(dish ? [dish.category] : []),
        ...words.flatMap((w) => w.tags ?? []),
        ...proteinGroups,
        ...ingredients.filter((i) => i.certainty === "listed").map((i) => i.key),
      ]),
    );
    const icon = pickIcon(tags);

    dishes.push({
      id: `${analysisId}-${dishes.length + 1}`,
      // Thai doesn't put spaces inside a name; OCR sometimes does ("ผัดกะ เพรา").
      nameThai: item.thai.replace(/(?<=[฀-๿])\s+(?=[฀-๿])/g, ""),
      nameEn:
        quality !== "none"
          ? englishName(dish, words, choices)
          : words.length > 0
            ? `Unlisted dish (mentions ${words.map((w) => w.en).join(", ")})`
            : "Unlisted dish",
      price: item.price,
      tags,
      ingredients,
      icon,
      iconBg: ICON_STYLES[icon].bg,
      iconColor: ICON_STYLES[icon].color,
      inGuide: dish !== null,
      ...(dish ? { romanized: dish.romanized, description: dish.description, spice: dish.spice } : {}),
      ...(uncertainties.length > 0 ? { uncertainties } : {}),
    });
  }

  return dishes;
}
