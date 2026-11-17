/* eslint-disable @typescript-eslint/ban-ts-comment -- vitest is run with npx, not a project dependency, so its globals have no types here */
// @ts-nocheck — vitest globals (describe/it/expect) aren't project types; this keeps `next build` unaffected.
// TC7 — OCR parser and deterministic guide lookup (test plan §3.1).
// Hand-made OCR boxes {text, score, box:[x0,y0,x1,y1]} → parseMenuLines → matchMenuLine / buildDishes.
import { parseMenuLines } from "@/lib/server/menu/parse-ocr";
import { buildDishes } from "@/lib/server/menu/build-dishes";
import { matchMenuLine } from "@/lib/server/thai-food/match";

type Box = [number, number, number, number];
/** One OCR text box. Rows are 30 px tall; names sit at x 50–330, prices at x 600–660. */
const line = (text: string, box: Box) => ({ text, score: 0.99, box });
const name = (text: string, y: number) => line(text, [50, y, 330, y + 30]);
const price = (text: string, y: number) => line(text, [600, y, 660, y + 30]);
const pairs = (items: { name: string; price: number | null }[]) => items.map((i) => [i.name, i.price]);
const listed = (dish) => dish.ingredients.filter((i) => i.certainty === "listed");

describe("TC7 — parseMenuLines: names and prices", () => {
  it("1. pairs each name with the price on its own row", () => {
    const items = parseMenuLines([
      name("ผัดกะเพราหมูสับ", 100), price("60", 100),
      name("ต้มยำกุ้ง", 160), price("120", 160),
      name("ข้าวผัดปู", 220), price("80", 220),
    ]);
    expect(pairs(items)).toEqual([["ผัดกะเพราหมูสับ", 60], ["ต้มยำกุ้ง", 120], ["ข้าวผัดปู", 80]]);
  });

  it("2. tilted photo: each price box 18 px lower than its name is still paired correctly", () => {
    const items = parseMenuLines([
      name("ผัดกะเพราหมูสับ", 100), price("60", 118),
      name("ต้มยำกุ้ง", 160), price("120", 178),
      name("ข้าวผัดปู", 220), price("80", 238),
    ]);
    expect(pairs(items)).toEqual([["ผัดกะเพราหมูสับ", 60], ["ต้มยำกุ้ง", 120], ["ข้าวผัดปู", 80]]);
  });

  it("3. price in the same box with dot leaders and บาท", () => {
    const items = parseMenuLines([line("ผัดกะเพราหมูสับ ....... 60 บาท", [50, 100, 660, 130])]);
    expect(pairs(items)).toEqual([["ผัดกะเพราหมูสับ", 60]]);
  });

  it("4. a missing price stays null (never guessed)", () => {
    const items = parseMenuLines([name("ผัดกะเพราหมูสับ", 100), price("60", 100), name("ต้มยำกุ้ง", 160)]);
    expect(items.find((i) => i.name === "ต้มยำกุ้ง")?.price).toBeNull();
  });

  it("5. a lone บาท box is not a dish", () => {
    const items = parseMenuLines([name("ต้มยำกุ้ง", 100), price("120", 100), line("บาท", [670, 100, 720, 130])]);
    expect(items.map((i) => i.name)).not.toContain("บาท");
    expect(pairs(items)).toEqual([["ต้มยำกุ้ง", 120]]);
  });

  it("6. Thai digits: ๖๐ → 60", () => {
    const items = parseMenuLines([name("ผัดกะเพราหมูสับ", 100), price("๖๐", 100)]);
    expect(pairs(items)).toEqual([["ผัดกะเพราหมูสับ", 60]]);
  });

  it("7. item numbers and stars are removed", () => {
    const items = parseMenuLines([
      line("1. ผัดไทยกุ้งสด 70", [50, 100, 660, 130]),
      line("★ 5.ต้มยำกุ้ง 120", [50, 160, 660, 190]),
    ]);
    expect(pairs(items)).toEqual([["ผัดไทยกุ้งสด", 70], ["ต้มยำกุ้ง", 120]]);
  });

  it("8. a phone number line is not a dish or a price", () => {
    const items = parseMenuLines([name("ต้มยำกุ้ง", 100), price("120", 100), line("โทร. 095-849-1234", [50, 160, 660, 190])]);
    expect(pairs(items)).toEqual([["ต้มยำกุ้ง", 120]]);
  });

  it("9. Thai menu: an English copy without a price is dropped; Carbonara 125 is kept as a dish", () => {
    const items = parseMenuLines([
      name("ผัดไทยกุ้งสด", 100), price("70", 100),
      line("Pad Thai with shrimp", [50, 132, 330, 156]), // translation under the Thai name, no price
      name("ต้มยำกุ้ง", 180), price("120", 180),
      name("ข้าวผัดปู", 240), price("80", 240),
      name("Carbonara", 300), price("125", 300),
    ]);
    expect(items.map((i) => i.name)).not.toContain("Pad Thai with shrimp");
    expect(pairs(items)).toContainEqual(["Carbonara", 125]);
    const dishes = buildDishes(items, "t");
    expect(dishes.find((d) => d.nameThai === "Carbonara")?.price).toBe(125);
  });

  it("10. the same input twice gives identical output", () => {
    const input = () => [
      name("ผัดกะเพราหมูสับ", 100), price("60", 118),
      name("ข้าวมันไท่", 160), price("50", 178),
      name("หมูนุ่มซอสเชฟ", 220), price("99", 238),
    ];
    const run = () => buildDishes(parseMenuLines(input()), "same");
    expect(run()).toEqual(run());
  });
});

describe("TC7 — guide lookup (matchMenuLine / buildDishes)", () => {
  it("11. exact guide match: ผัดกะเพราหมูสับ", () => {
    expect(matchMenuLine("ผัดกะเพราหมูสับ").quality).toBe("exact");
    const [dish] = buildDishes([{ name: "ผัดกะเพราหมูสับ", price: 60 }], "t");
    expect(dish.inGuide).toBe(true);
    // The protein is keyed "minced pork"; its allergen group is "pork".
    expect(listed(dish).some((i) => i.key === "minced pork" && i.groups?.includes("pork"))).toBe(true);
    expect(dish.uncertainties ?? []).toEqual([]);
  });

  it("12. spaces inside the Thai name don't change the matched dish", () => {
    const a = matchMenuLine("ผัดกะเพราหมูสับ");
    const b = matchMenuLine("ผัดกะเพรา หมูสับ");
    expect(b.dish?.id).toBe(a.dish?.id);
    expect(b.dish?.id).toBeTruthy();
  });

  it("13. tone marks and a common misspelling are the same dish (by design)", () => {
    expect(matchMenuLine("ต้มยำกุง").dish?.id).toBe(matchMenuLine("ต้มยำกุ้ง").dish?.id);
    expect(matchMenuLine("ผัดกะเพาหมูสับ").dish?.id).toBe(matchMenuLine("ผัดกะเพราหมูสับ").dish?.id);
    expect(matchMenuLine("ต้มยำกุ้ง").dish?.id).toBeTruthy();
  });

  it("14. a real OCR letter error (ข้าวมันไท่) matches ข้าวมันไก่ as fuzzy, flagged as a possible misread", () => {
    const m = matchMenuLine("ข้าวมันไท่");
    expect(m.quality).toBe("fuzzy");
    expect(m.dish?.id).toBe(matchMenuLine("ข้าวมันไก่").dish?.id);
    const [dish] = buildDishes([{ name: "ข้าวมันไท่", price: 50 }], "t");
    expect((dish.uncertainties ?? []).some((u) => u.includes("misread"))).toBe(true);
  });

  it("15. ผัดกะเพรา with no meat named carries an uncertainty about the meat", () => {
    const [dish] = buildDishes([{ name: "ผัดกะเพรา", price: 50 }], "t");
    expect((dish.uncertainties ?? []).some((u) => /meat/i.test(u))).toBe(true);
  });

  it("16. an unlisted dish keeps its Thai name and price, with no listed ingredients and an uncertainty", () => {
    const [dish] = buildDishes([{ name: "หมูนุ่มซอสเชฟ", price: 99 }], "t");
    expect(dish.nameThai).toBe("หมูนุ่มซอสเชฟ");
    expect(dish.price).toBe(99);
    expect(dish.inGuide).toBe(false);
    expect(listed(dish)).toEqual([]);
    expect((dish.uncertainties ?? []).length).toBeGreaterThan(0);
  });
});
