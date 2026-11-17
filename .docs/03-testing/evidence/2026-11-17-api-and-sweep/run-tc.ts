// Ad-hoc checks for TC7 / TC9 / TC11 (run from YummyNaKha_App with tsx --conditions=react-server).
import { categorizeDish, categorizeMenu } from "@/lib/matching";
import type { ExtractedDish, InferredIngredient, TasteProfile } from "@/lib/types";
import { parseMenuLines } from "@/lib/server/menu/parse-ocr";
import { buildDishes } from "@/lib/server/menu/build-dishes";
import { matchMenuLine } from "@/lib/server/thai-food/match";
import { DISHES } from "@/lib/server/thai-food/dishes";

const STAFF = "confirm with restaurant staff";
type R = { tc: string; name: string; ok: boolean; detail?: string };
const results: R[] = [];
const check = (tc: string, name: string, ok: boolean, detail?: string) => results.push({ tc, name, ok, detail });

// ---------- TC9: matching rules on controlled dishes ----------
const ing = (key: string, certainty: "listed" | "common", groups: string[] = []): InferredIngredient => ({ key, label: key, certainty, groups });
const dish = (o: Partial<ExtractedDish>): ExtractedDish =>
  ({ id: "d", nameThai: "x", nameEn: "x", price: 60, tags: [], ingredients: [], inGuide: true, ...o }) as ExtractedDish;
const P = (avoid: TasteProfile["avoid"], favs: string[] = [], spice?: TasteProfile["spice"]): TasteProfile => ({ avoid, favs, ...(spice !== undefined ? { spice } : {}) });
const peanutAllergy = P([{ name: "Peanuts", reason: "allergy" }]);

const cases: [string, ExtractedDish, TasteProfile, string][] = [
  ["Listed peanut + peanut allergy → Avoid", dish({ ingredients: [ing("peanut", "listed", ["peanut", "nuts"])] }), peanutAllergy, "avoid"],
  ["Common peanut + allergy → Check First", dish({ ingredients: [ing("peanut", "common", ["peanut"])] }), peanutAllergy, "check"],
  ["Ordinary dislike (mushroom) → Check First", dish({ ingredients: [ing("mushroom", "listed")] }), P([{ name: "Mushroom", reason: "dislike" }]), "check"],
  ["Oyster sauce via Shellfish group (doctor) → Avoid", dish({ ingredients: [ing("oyster sauce", "listed", ["oyster", "shellfish"])] }), P([{ name: "Shellfish", reason: "doctor" }]), "avoid"],
  ["No conflict, complete info → Top Pick", dish({ ingredients: [ing("chicken", "listed")] }), peanutAllergy, "top"],
  ["Uncertain info, no conflict → Check First", dish({ ingredients: [ing("chicken", "listed")], uncertainties: ["protein not stated"] }), peanutAllergy, "check"],
  ["Not in guide → Check First", dish({ inGuide: false }), peanutAllergy, "check"],
  ["Uncertain + listed allergy → Avoid", dish({ ingredients: [ing("peanut", "listed")], uncertainties: ["fuzzy"] }), peanutAllergy, "avoid"],
  ["Hotter than spice level → Check First", dish({ spice: 3, ingredients: [ing("chicken", "listed")] }), P([], [], 1), "check"],
];
for (const [name, d, p, want] of cases) {
  const got = categorizeDish(d, p);
  check("TC9", name, got.status === want, `got ${got.status}`);
}
{
  const got = categorizeDish(dish({ tags: ["shrimp"], ingredients: [ing("peanut", "listed")] }), P([{ name: "Peanuts", reason: "allergy" }], ["shrimp"]));
  check("TC9", "A favourite never lifts an Avoid dish", got.status === "avoid" && got.favMatches.length === 0);
}
{
  const menu = [dish({ id: "a", uncertainties: ["u"] }), dish({ id: "b", inGuide: false })];
  const got = categorizeMenu(menu, peanutAllergy);
  check("TC9", "All-uncertain menu: Top Pick stays empty", got.every((d) => d.status !== "top"));
}
{
  const d = dish({ choices: [{ name: "Pork", nameThai: "หมู", price: 50, ingredients: [ing("peanut", "listed")] }, { name: "Prawn", nameThai: "กุ้ง", price: 60, ingredients: [ing("peanut", "listed")] }] as ExtractedDish["choices"] });
  check("TC9", "Every meat choice has listed allergen → Avoid", categorizeDish(d, peanutAllergy).status === "avoid");
}

// ---------- TC9 + TC11: whole guide sweep (247 dishes × 3 personas) ----------
const personas: TasteProfile[] = [
  P([{ name: "Peanuts", reason: "allergy" }]),
  P([{ name: "Shellfish", reason: "doctor" }, { name: "Gluten", reason: "allergy" }]),
  P([{ name: "Pork", reason: "dislike" }, { name: "Egg", reason: "allergy" }], ["chicken"], 1),
];
const items = DISHES.map((d, i) => ({ name: d.th[0], price: 40 + i }));
const built = buildDishes(items, "sweep");
let missed = 0, staffMissing = 0, uncertainTop = 0, total = 0;
const banned = /\b(safe|certified|guarantee[d]?|100%|allergy-free|doctor[- ]approved|nutritionist)\b/i;
let bannedHits = 0, scoreHits = 0;
for (const p of personas) {
  for (const d of categorizeMenu(built, p)) {
    total++;
    const listedSensitive = p.avoid.some((a) => (a.reason === "allergy" || a.reason === "doctor") &&
      d.ingredients.some((g) => g.certainty === "listed" && [g.key, ...(g.groups ?? [])].some((k) => k.toLowerCase().replace(/s$/, "") === a.name.toLowerCase().replace(/s$/, ""))));
    if (listedSensitive && d.status !== "avoid") missed++;
    if (d.status !== "top" && d.conflicts.length > 0 && !d.conflicts.every((c) => c.note.toLowerCase().includes(STAFF))) staffMissing++;
    if ((d.uncertainties?.length ?? 0) > 0 && d.status === "top") uncertainTop++;
    const text = [d.nameEn, ...d.conflicts.map((c) => c.note), ...(d.uncertainties ?? [])].join(" ");
    if (banned.test(text)) bannedHits++;
    if (/\d+\s?%/.test(text)) scoreHits++;
  }
}
check("TC9", `Guide sweep: listed allergy/doctor conflicts missed (of ${total} results)`, missed === 0, `${missed} missed`);
check("TC9", "Guide sweep: uncertain dish shown as Top Pick", uncertainTop === 0, `${uncertainTop}`);
check("TC11", "Every Check/Avoid conflict note says confirm with staff", staffMissing === 0, `${staffMissing} missing`);
check("TC11", "No safe/certified/100% wording in generated results", bannedHits === 0, `${bannedHits} hits`);
check("TC11", "No percentage/score in generated results", scoreHits === 0, `${scoreHits} hits`);

// ---------- TC7: parser and guide lookup ----------
const L = (text: string, x0: number, y0: number, x1: number, y1: number) => ({ text, score: 0.99, box: [x0, y0, x1, y1] as [number, number, number, number] });
{
  const parsed = parseMenuLines([L("ผัดกะเพราหมูสับ", 10, 10, 200, 40), L("60", 400, 12, 440, 40), L("ข้าวผัดกุ้ง", 10, 60, 180, 90), L("70", 400, 64, 440, 92)]);
  check("TC7", "Names pair with their row prices", parsed.length === 2 && parsed[0].price === 60 && parsed[1].price === 70, JSON.stringify(parsed.map((p) => [p.name, p.price])));
}
{
  const parsed = parseMenuLines([L("ผัดกะเพราหมูสับ", 10, 10, 200, 40), L("60", 400, 22, 440, 50), L("ข้าวผัดกุ้ง", 10, 60, 180, 90), L("70", 400, 74, 440, 102)]);
  check("TC7", "Tilted rows still pair correctly", parsed.length === 2 && parsed[0].price === 60 && parsed[1].price === 70, JSON.stringify(parsed.map((p) => [p.name, p.price])));
}
{
  const parsed = parseMenuLines([L("ผัดกะเพราหมูสับ 60", 10, 10, 300, 40)]);
  check("TC7", "Inline 'ผัดกะเพราหมูสับ 60' reads name + price", parsed.length === 1 && parsed[0].price === 60, JSON.stringify(parsed));
}
{
  const parsed = parseMenuLines([L("ต้มยำกุ้ง", 10, 10, 200, 40), L("บาท", 500, 12, 540, 40)]);
  check("TC7", "Missing price stays null; lone บาท is not a dish", parsed.length === 1 && parsed[0].price === null, JSON.stringify(parsed));
}
{
  const a = JSON.stringify(matchMenuLine("ผัดกะเพราหมูสับ")), b = JSON.stringify(matchMenuLine("ผัดกะเพราหมูสับ"));
  const m = matchMenuLine("ผัดกะเพราหมูสับ");
  check("TC7", "Same input → same guide match (deterministic)", a === b && m.dish !== null && m.quality === "exact", `${m.quality} ${m.dish?.en}`);
}
{
  const [d] = buildDishes([{ name: "ข้าวผัดกุ่ง", price: 60 }], "t"); // tone-mark OCR error on กุ้ง
  check("TC7", "Tone-mark OCR error still finds the dish", d?.nameEn === "Fried Rice with shrimp", `${d?.nameEn}`);
}
{
  const m = matchMenuLine("หมูกรอบผัดพริกเกลือสูตรเจ๊");
  const [d] = buildDishes([{ name: "หมูกรอบผัดพริกเกลือสูตรเจ๊", price: 80 }], "f");
  check("TC7", "Approximate (fuzzy) match carries an uncertainty note", m.quality === "fuzzy" && (d?.uncertainties?.length ?? 0) > 0, `${m.quality} → ${m.dish?.en}`);
}
{
  const [d] = buildDishes([{ name: "ผัดกะเพรา", price: 50 }], "p");
  check("TC7", "Missing protein → uncertainty note", (d?.uncertainties ?? []).some((u) => /meat|seafood/i.test(u)), JSON.stringify(d?.uncertainties));
}
{
  const [d] = buildDishes([{ name: "ปลาหมึกย่างซอสเจ๊แดง", price: 90 }], "u");
  const thaiOnly = d && d.ingredients.length === 0 && (d.nameEn === d.nameThai || d.nameEn === "");
  check("TC7", "Unlisted dish keeps Thai + price, no English/ingredients (spec fallback)", !!thaiOnly, d ? `nameEn="${d.nameEn}", ${d.ingredients.length} ingredients` : "dropped");
}

// ---------- report ----------
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.tc}  ${r.name}${r.detail ? `  [${r.detail}]` : ""}`);
const by = (tc: string) => results.filter((r) => r.tc === tc);
for (const tc of ["TC7", "TC9", "TC11"]) console.log(`${tc}: ${by(tc).filter((r) => r.ok).length}/${by(tc).length} checks pass`);
console.log(`guide dishes built: ${built.length}/${DISHES.length}`);
