/* eslint-disable @typescript-eslint/ban-ts-comment -- vitest is run with npx, not a project dependency, so its globals have no types here */
// @ts-nocheck — vitest globals (describe/it/expect/afterAll) aren't project types; this keeps `next build` unaffected.
// TC9 — Profile matching and uncertainty (test plan §3.1; NFR4, F10, LR12).
// Each dish is built with buildDishes([{ name, price }]) and labelled with categorizeDish.
// Expected labels were written from the spec rules BEFORE running:
//   listed allergy / doctor conflict → avoid · unrelated allergy → not avoid ·
//   dislike, unknown reason, too spicy, not in guide, meat not named, possible misread → check (never top).
// Health data here is fictional.
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildDishes } from "@/lib/server/menu/build-dishes";
import { categorizeDish } from "@/lib/matching";

type Reason = "allergy" | "doctor" | "dislike" | undefined;
interface Pair {
  group: "A" | "B" | "C";
  dish: string;
  price: number;
  avoid?: { name: string; reason: Reason };
  spice?: 0 | 1 | 2 | 3;
  expected: "avoid" | "not-avoid" | "check";
  why: string;
}

const A = (dish: string, name: string, reason: Reason = "allergy"): Pair => ({
  group: "A", dish, price: 60, avoid: { name, reason }, expected: "avoid", why: `listed ${name} (${reason})`,
});
const B = (dish: string, name: string): Pair => ({
  group: "B", dish, price: 60, avoid: { name, reason: "allergy" }, expected: "not-avoid", why: `${name} allergy, not in the dish`,
});
const C = (dish: string, price: number, why: string, extra: Partial<Pair> = {}): Pair => ({
  group: "C", dish, price, expected: "check", why, ...extra,
});

const PAIRS: Pair[] = [
  // Group A — 20 listed allergy / doctor conflicts → avoid
  A("ผัดไทยกุ้งสด", "shrimp"),
  A("ต้มยำกุ้ง", "shrimp"),
  A("ข้าวผัดกุ้ง", "shellfish"),
  A("ผัดกะเพราหมูสับ", "pork", "doctor"),
  A("ข้าวมันไก่", "chicken"),
  A("ไข่เจียว", "egg"),
  A("ข้าวผัดปู", "crab"),
  A("ปลาทอดกระเทียม", "fish"),
  A("หมูกระเทียม", "pork", "doctor"),
  A("คอหมูย่าง", "pork", "doctor"),
  A("ไก่ผัดเม็ดมะม่วงหิมพานต์", "chicken"),
  A("ปลาหมึกทอดกระเทียม", "squid"),
  A("ต้มข่าไก่", "chicken"),
  A("แกงเขียวหวานไก่", "chicken"),
  A("ไข่ดาว", "egg"),
  A("กุ้งอบวุ้นเส้น", "shrimp"),
  A("ไก่ทอด", "chicken"),
  A("ผัดซีอิ๊วหมู", "pork", "doctor"),
  A("ข้าวไข่เจียว", "egg"),
  A("ผัดกะเพราไก่", "chicken"),

  // Group B — the same 20 dishes with an allergy to something not in the dish → not avoid
  B("ผัดไทยกุ้งสด", "beef"),
  B("ต้มยำกุ้ง", "pork"),
  B("ข้าวผัดกุ้ง", "peanut"),
  B("ผัดกะเพราหมูสับ", "shrimp"),
  B("ข้าวมันไก่", "shrimp"),
  B("ไข่เจียว", "peanut"),
  B("ข้าวผัดปู", "pork"),
  B("ปลาทอดกระเทียม", "peanut"),
  B("หมูกระเทียม", "chicken"),
  B("คอหมูย่าง", "shrimp"),
  B("ไก่ผัดเม็ดมะม่วงหิมพานต์", "pork"),
  B("ปลาหมึกทอดกระเทียม", "chicken"),
  B("ต้มข่าไก่", "pork"),
  B("แกงเขียวหวานไก่", "beef"),
  B("ไข่ดาว", "shrimp"),
  B("กุ้งอบวุ้นเส้น", "chicken"),
  B("ไก่ทอด", "shrimp"),
  B("ผัดซีอิ๊วหมู", "shrimp"),
  B("ข้าวไข่เจียว", "chicken"),
  B("ผัดกะเพราไก่", "pork"),

  // Group C — 20 that must be Check First, never Top Pick
  C("ผัดไทยกุ้งสด", 70, "dislike: listed shrimp", { avoid: { name: "shrimp", reason: "dislike" } }),
  C("ข้าวมันไก่", 50, "dislike: listed chicken", { avoid: { name: "chicken", reason: "dislike" } }),
  C("ไข่เจียว", 40, "dislike: listed egg", { avoid: { name: "egg", reason: "dislike" } }),
  C("ข้าวผัดปู", 80, "dislike: listed crab", { avoid: { name: "crab", reason: "dislike" } }),
  C("หมูกระเทียม", 60, "dislike: listed garlic", { avoid: { name: "garlic", reason: "dislike" } }),
  C("ต้มข่าไก่", 90, "dislike: listed coconut milk", { avoid: { name: "coconut milk", reason: "dislike" } }),
  C("ผัดซีอิ๊วหมู", 60, "dislike: listed pork", { avoid: { name: "pork", reason: "dislike" } }),
  C("กุ้งอบวุ้นเส้น", 150, "dislike: listed ginger", { avoid: { name: "ginger", reason: "dislike" } }),
  C("ไก่ทอด", 60, "avoid chicken, reason not given", { avoid: { name: "chicken", reason: undefined } }),
  C("ต้มยำกุ้ง", 120, "spice level 0 vs very spicy", { spice: 0 }),
  C("ผัดกะเพราไก่", 60, "spice level 0 vs very spicy", { spice: 0 }),
  C("แกงเขียวหวานไก่", 80, "spice level 0 vs medium spicy", { spice: 0 }),
  C("ชนิทเซลหมู", 150, "not in the dish guide"),
  C("ซีซาร์สลัด", 120, "not in the dish guide"),
  C("คาโบนาร่า", 125, "not in the dish guide"),
  C("หมูนุ่มซอสเชฟ", 99, "not in the dish guide"),
  C("ผัดกะเพรา", 50, "meat not named"),
  C("ข้าวผัด", 50, "meat not named"),
  C("ข้าวมันไท่", 50, "real OCR misread (fuzzy match)"),
  C("ต้มยำกุ้ม", 60, "real OCR misread"),
];

function run(p: Pair) {
  const [dish] = buildDishes([{ name: p.dish, price: p.price }], `tc9-${p.group}`);
  const profile = { favs: [], avoid: p.avoid ? [p.avoid] : [], ...(p.spice !== undefined ? { spice: p.spice } : {}) };
  return categorizeDish(dish, profile);
}

const results = PAIRS.map((p) => {
  const r = run(p);
  return {
    group: p.group,
    dish: p.dish,
    profile: { avoid: p.avoid ?? null, spice: p.spice ?? null },
    expected: p.expected,
    actual: r.status,
    why: p.why,
    reasons: [...r.conflicts.map((c) => `${c.name}: ${c.note}`), ...(r.uncertainties ?? [])],
    result: r,
  };
});
const inGroup = (g: Pair["group"]) => results.filter((r) => r.group === g);

describe("TC9 — profile matching and uncertainty (60 pairs)", () => {
  it("has 20 pairs in each group", () => {
    expect(inGroup("A")).toHaveLength(20);
    expect(inGroup("B")).toHaveLength(20);
    expect(inGroup("C")).toHaveLength(20);
  });

  it("Group A: missed conflicts (not Avoid) ≤ 5% — at most 1 of 20", () => {
    const missed = inGroup("A").filter((r) => r.actual !== "avoid");
    expect(missed.length, `missed: ${missed.map((r) => `${r.dish}/${r.profile.avoid?.name} → ${r.actual}`).join(", ")}`).toBeLessThanOrEqual(1);
  });

  it("Group B: false Avoid ≤ 10% — at most 2 of 20 (Check First reported separately)", () => {
    const falseAvoid = inGroup("B").filter((r) => r.actual === "avoid");
    expect(falseAvoid.length).toBeLessThanOrEqual(2);
  });

  it("Group C: none of 20 reach Top Pick", () => {
    expect(inGroup("C").filter((r) => r.actual === "top").map((r) => r.dish)).toEqual([]);
  });

  it("Group C: a dislike is never Avoid", () => {
    const dislikes = inGroup("C").filter((r) => r.profile.avoid && r.profile.avoid.reason !== "allergy" && r.profile.avoid.reason !== "doctor");
    expect(dislikes.filter((r) => r.actual === "avoid").map((r) => r.dish)).toEqual([]);
  });

  it("every conflict note tells the diner to confirm with restaurant staff", () => {
    const notes = results.flatMap((r) => r.result.conflicts.map((c) => c.note));
    expect(notes.length).toBeGreaterThan(0);
    expect(notes.filter((n) => !n.toLowerCase().includes("confirm with restaurant staff"))).toEqual([]);
  });

  it('no result says a dish is "safe"', () => {
    const text = results.map((r) => JSON.stringify(r.result)).filter((t) => /\bsafe\b/i.test(t));
    expect(text).toEqual([]);
  });
});

afterAll(() => {
  const count = (g: Pair["group"], s: string) => inGroup(g).filter((r) => r.actual === s).length;
  const summary = {
    A: { pairs: 20, avoid: count("A", "avoid"), check: count("A", "check"), top: count("A", "top"), missedConflicts: 20 - count("A", "avoid"), threshold: "≤ 1 (5%)" },
    B: { pairs: 20, avoid: count("B", "avoid"), check: count("B", "check"), top: count("B", "top"), falseAvoid: count("B", "avoid"), threshold: "≤ 2 (10%)" },
    C: { pairs: 20, avoid: count("C", "avoid"), check: count("C", "check"), top: count("C", "top"), threshold: "0 Top Pick; dislikes never Avoid" },
  };
  const dir = fileURLToPath(new URL("../results/", import.meta.url));
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    `${dir}tc9-results.json`,
    JSON.stringify(
      {
        test: "TC9 — profile matching and uncertainty",
        date: new Date().toISOString(),
        summary,
        pairs: results.map(({ result, ...rest }) => ({ ...rest, inGuide: result.inGuide, nameEn: result.nameEn })),
      },
      null,
      2,
    ) + "\n",
  );
});
