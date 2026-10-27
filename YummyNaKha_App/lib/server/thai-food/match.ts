import "server-only";
import { DISHES, type GuideDish } from "./dishes";
import { VARIANTS } from "./variants";
import { WORDS, type MenuWord } from "./words";

// Matches one menu line ("ผัดกะ เพราหมูสับ") to a guide dish (ผัดกะเพรา) plus the
// menu words in the rest of the line (หมูสับ). When no guide dish fits, the
// line is read word by word instead ("decoded"). Deterministic: the same line
// always gives the same answer.

/**
 * Comparison form of Thai text: no spaces, punctuation, digits or Latin
 * letters, and no tone marks / small diacritics, which OCR often drops or
 * confuses (ซีอิ๊ว, ซีอิ้ว and ซีอิว all become ซีอิว).
 */
export function normalizeThai(text: string): string {
  return text
    .normalize("NFC")
    .replace(/ํา/g, "ำ") // ํ + า → ำ (OCR sometimes splits sara am)
    .replace(/[็-๎]/g, "") // ็ ่ ้ ๊ ๋ ์ ํ ๎
    .replace(/ฃ/g, "ข")
    .replace(/ฅ/g, "ค")
    .replace(/[^ก-ฺเ-ๆ]/g, ""); // keep Thai letters and vowels only
}

/**
 * Folds letters OCR often confuses in Thai menu fonts (ด/ต, ข/ช/ซ, ึ/ื, ำ/า,
 * and ั read in place of a tone mark), so "ด้มจืด" or "ตัมยำ" can still be
 * found. Only used for a second, uncertain pass.
 */
export function foldOcrConfusions(normalized: string): string {
  return normalized
    .replace(/ด/g, "ต")
    .replace(/[ขซ]/g, "ช")
    .replace(/ึ/g, "ื")
    .replace(/ำ/g, "า")
    .replace(/\u0E31/g, "");
}

interface Alias<T> {
  key: string;
  item: T;
}

/** `fold` builds the look-alike vocabulary; folded names shorter than `minLength` are left out (too easy to hit by chance). */
function aliases<T extends { th: string[] }>(items: T[], fold = false, minLength = 1): Alias<T>[] {
  return items
    .flatMap((item) => item.th.map((th) => ({ key: fold ? foldOcrConfusions(normalizeThai(th)) : normalizeThai(th), item })))
    .filter((a) => a.key.length >= minLength)
    .sort((a, b) => b.key.length - a.key.length);
}

const DISH_ALIASES = aliases(DISHES);
const WORD_ALIASES = aliases<MenuWord>([...VARIANTS, ...WORDS]);
const FOLDED_DISH_ALIASES = aliases(DISHES, true, 4);
const FOLDED_WORD_ALIASES = aliases<MenuWord>([...VARIANTS, ...WORDS], true, 3);

/** Shortest alias allowed to match with OCR errors; shorter ones must match exactly. */
const FUZZY_MIN_LENGTH = 6;
/** Share of a line that must be known words before it is read word by word. */
const DECODE_MIN_COVERAGE = 0.6;
/**
 * A line this well explained by known words is read word by word rather than
 * fuzzily matched: "หมึกทอดกระเทียม" is squid, not a misread "หมูทอดกระเทียม".
 */
const DECODE_BEFORE_FUZZY = 0.8;

/** Words that describe the dish itself; one of these before a guide name means a different dish. */
const DESCRIBING: ReadonlySet<MenuWord["kind"]> = new Set(["method", "dish", "flavor", "ingredient"]);

/** Reads known menu words left to right, longest first; returns them and how much of the text they cover. */
export function tokenize(text: string, vocabulary = WORD_ALIASES): { words: MenuWord[]; coverage: number } {
  const words: MenuWord[] = [];
  let known = 0;
  let i = 0;
  while (i < text.length) {
    const hit = vocabulary.find((a) => text.startsWith(a.key, i));
    if (!hit) {
      i++;
      continue;
    }
    if (!words.includes(hit.item)) words.push(hit.item);
    known += hit.key.length;
    i += hit.key.length;
  }
  return { words, coverage: text.length > 0 ? known / text.length : 0 };
}

/**
 * Best approximate occurrence of `pattern` inside `text` (Sellers' algorithm):
 * the fewest edits, and where that occurrence ends.
 */
function approximateFind(pattern: string, text: string): { distance: number; end: number } {
  const m = pattern.length;
  let prev = Array.from({ length: m + 1 }, (_, i) => i);
  let best = { distance: m, end: 0 };
  for (let j = 1; j <= text.length; j++) {
    const curr = [0];
    for (let i = 1; i <= m; i++) {
      const cost = pattern[i - 1] === text[j - 1] ? 0 : 1;
      curr[i] = Math.min(prev[i] + 1, curr[i - 1] + 1, prev[i - 1] + cost);
    }
    if (curr[m] < best.distance) best = { distance: curr[m], end: j };
    prev = curr;
  }
  return best;
}

export interface DishMatch {
  dish: GuideDish | null;
  /** Menu words outside the guide name (or the whole line when decoded). */
  words: MenuWord[];
  /**
   * "exact" / "fuzzy" (OCR errors allowed) guide match; "decoded" = no guide
   * dish, read word by word; "none" = not recognisable.
   */
  quality: "exact" | "fuzzy" | "decoded" | "none";
  /** Share of the line explained by known words (decoded lines only). */
  coverage: number;
}

interface Candidate {
  dish: GuideDish;
  start: number;
  end: number;
}

/** A guide name counts only if nothing that describes another dish comes before it. */
function startsTheDish(line: string, candidate: Candidate, vocabulary = WORD_ALIASES) {
  return !tokenize(line.slice(0, candidate.start), vocabulary).words.some((w) => DESCRIBING.has(w.kind));
}

function findExact(line: string, dishes = DISH_ALIASES, vocabulary = WORD_ALIASES): Candidate | null {
  // Thai dish names put the head word first (ข้าวผัดกระเทียม is fried rice, not
  // a garlic stir-fry), so the earliest match wins, then the longest.
  const exact: Candidate[] = [];
  for (const { key, item } of dishes) {
    const start = line.indexOf(key);
    if (start !== -1) exact.push({ dish: item, start, end: start + key.length });
  }
  exact.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
  return exact.find((c) => startsTheDish(line, c, vocabulary)) ?? null;
}

function findFuzzy(line: string): Candidate | null {
  // About one OCR error per 7 characters, never more than 2.
  let fuzzy: (Candidate & { score: number }) | null = null;
  for (const { key, item } of DISH_ALIASES) {
    if (key.length < FUZZY_MIN_LENGTH) continue;
    const allowed = Math.min(2, Math.floor(key.length / 7) || 1);
    const { distance, end } = approximateFind(key, line);
    if (distance > allowed) continue;
    const candidate = { dish: item, start: Math.max(0, end - key.length), end, score: key.length - distance * 2 };
    if ((!fuzzy || candidate.score > fuzzy.score) && startsTheDish(line, candidate)) fuzzy = candidate;
  }
  return fuzzy ? { dish: fuzzy.dish, start: fuzzy.start, end: fuzzy.end } : null;
}

/**
 * Fish species named inside a dish name (ปลานิลราดพริก) are collapsed to ปลา, so
 * the guide's ปลาราดพริก still matches; the species itself is kept as the protein.
 * Spellings are in normalized form (no tone marks).
 */
const FISH_SPECIES = /ปลา(?:นิล|ทับทิม|ชอน|ดุก|ทู|แซลมอน|กะพงขาว|กะพง|สลิด|กราย|เกา|อินทรี|ซาบะ)/g;

type Tokens = ReturnType<typeof tokenize>;

const better = (a: Tokens, b: Tokens) => (b.coverage > a.coverage ? b : a);

/** Menu words in a piece of menu text, read as printed or with OCR look-alikes folded — whichever explains more. */
export function readWords(thai: string): MenuWord[] {
  const line = normalizeThai(thai);
  return better(tokenize(line), tokenize(foldOcrConfusions(line), FOLDED_WORD_ALIASES)).words;
}
const decodable = (t: Tokens) => t.words.some((w) => w.kind !== "style");

export function matchMenuLine(thai: string): DishMatch {
  const line = normalizeThai(thai);
  if (!line) return { dish: null, words: [], quality: "none", coverage: 0 };
  const folded = foldOcrConfusions(line);

  // A guide name, read as printed or with OCR look-alike letters folded
  // together. The earlier, then longer, match wins: "ตัมยำ…" is a misread
  // ต้มยำ, not the salad ยำ. A match found only by folding is uncertain.
  const exact = findExact(line);
  const lookAlike = findExact(folded, FOLDED_DISH_ALIASES, FOLDED_WORD_ALIASES);
  const useLookAlike =
    lookAlike && (!exact || lookAlike.start < exact.start || (lookAlike.start === exact.start && lookAlike.end - lookAlike.start > exact.end - exact.start + 1));
  if (exact && !useLookAlike) {
    const rest = `${line.slice(0, exact.start)}|${line.slice(exact.end)}`;
    const words = better(tokenize(rest), tokenize(foldOcrConfusions(rest), FOLDED_WORD_ALIASES)).words;
    return { dish: exact.dish, words, quality: "exact", coverage: 1 };
  }
  // Proteins named anywhere on the line, read as printed: never lost to a loose match.
  const named = tokenize(line).words.filter((w) => w.kind === "protein");
  const withNamed = (words: MenuWord[]) => [...words, ...named.filter((w) => !words.includes(w))];
  const generic = line.replace(FISH_SPECIES, "ปลา");
  const anyFish = generic !== line ? findExact(generic) : null;
  if (!useLookAlike && anyFish) {
    const rest = `${generic.slice(0, anyFish.start)}|${generic.slice(anyFish.end)}`;
    return { dish: anyFish.dish, words: withNamed(tokenize(rest).words), quality: "exact", coverage: 1 };
  }
  if (lookAlike) {
    const rest = `${folded.slice(0, lookAlike.start)}|${folded.slice(lookAlike.end)}`;
    return { dish: lookAlike.dish, words: withNamed(tokenize(rest, FOLDED_WORD_ALIASES).words), quality: "fuzzy", coverage: 1 };
  }

  const best = better(tokenize(line), tokenize(folded, FOLDED_WORD_ALIASES));
  if (decodable(best) && best.coverage >= DECODE_BEFORE_FUZZY) {
    return { dish: null, words: best.words, quality: "decoded", coverage: best.coverage };
  }

  // A fuzzy match keeps every word found in the whole line, so a protein the
  // menu names is never lost to a misread dish name.
  const fuzzy = findFuzzy(line);
  if (fuzzy) return { dish: fuzzy.dish, words: withNamed(best.words), quality: "fuzzy", coverage: 1 };

  const quality = decodable(best) && best.coverage >= DECODE_MIN_COVERAGE ? "decoded" : "none";
  return { dish: null, words: best.words, quality, coverage: best.coverage };
}
