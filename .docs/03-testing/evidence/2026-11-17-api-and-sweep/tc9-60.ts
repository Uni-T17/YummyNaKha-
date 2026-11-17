// TC9 measurement on a 60-pair controlled set built from real guide dishes.
// 20 listed sensitive conflicts, 20 no-conflict controls, 20 uncertainty / ordinary-dislike pairs.
// Expected labels come from the plan's rules applied to the guide's listed ingredients.
import { categorizeDish } from "@/lib/matching";
import type { TasteProfile } from "@/lib/types";
import { buildDishes } from "@/lib/server/menu/build-dishes";
import { DISHES } from "@/lib/server/thai-food/dishes";

const built = buildDishes(DISHES.map((d, i) => ({ name: d.th[0], price: 50 + i })), "s");
const has = (d: (typeof built)[number], name: string, cert: "listed" | "common") =>
  d.ingredients.some((g) => g.certainty === cert && [g.key, ...(g.groups ?? [])].some((k) => k.replace(/s$/, "") === name.replace(/s$/, "")));
const complete = built.filter((d) => (d.uncertainties?.length ?? 0) === 0 && d.inGuide !== false);
const ALLERGENS = ["peanut", "shellfish", "egg", "fish", "gluten", "milk"];

type Pair = { group: string; dish: string; profile: TasteProfile; expect: "top" | "check" | "avoid" | "not-top" };
const pairs: Pair[] = [];
// 20 listed sensitive conflicts, spread over allergens, alternating allergy / doctor.
for (const d of complete) {
  if (pairs.filter((p) => p.group === "conflict").length >= 20) break;
  const a = ALLERGENS.find((x) => has(d, x, "listed") && !pairs.some((p) => p.dish === d.nameThai));
  if (!a) continue;
  const n = pairs.filter((p) => p.group === "conflict").length;
  if (pairs.filter((p) => p.group === "conflict" && p.profile.avoid[0].name === a).length >= 4) continue;
  pairs.push({ group: "conflict", dish: d.nameThai, profile: { favs: [], avoid: [{ name: a, reason: n % 2 ? "doctor" : "allergy" }] }, expect: "avoid" });
}
// 20 no-conflict controls: complete dishes with neither listed nor common hit for the avoided item.
for (const d of complete) {
  if (pairs.filter((p) => p.group === "control").length >= 20) break;
  const a = ALLERGENS.find((x) => !has(d, x, "listed") && !has(d, x, "common"));
  if (!a || (d.spice ?? 0) > 3) continue;
  pairs.push({ group: "control", dish: d.nameThai, profile: { favs: [], avoid: [{ name: a, reason: "allergy" }] }, expect: "top" });
}
// 20 uncertainty / ordinary dislike: 10 fuzzy, unlisted or protein-missing dishes; 10 listed ordinary dislikes.
const uncertainNames = ["ผัดกะเพรา", "ข้าวผัด", "ผัดพริกแกง", "ราดหน้า", "ผัดซีอิ๊ว", "ปลาหมึกย่างซอสเจ๊แดง", "หมูกรอบผัดพริกเกลือสูตรเจ๊", "ไก่ทอดซอสเกาหลี", "แกงเขียวหวาณไก่", "ข้าวไข่เจียวทรงเครื่องพิเศษ"];
for (const name of uncertainNames) {
  const [d] = buildDishes([{ name, price: 60 }], "u");
  if (d) pairs.push({ group: "uncertain", dish: d.nameThai, profile: { favs: [], avoid: [] }, expect: "not-top" });
}
for (const d of complete) {
  if (pairs.filter((p) => p.group === "uncertain").length >= 20) break;
  if (!has(d, "pork", "listed") || pairs.some((p) => p.dish === d.nameThai)) continue;
  pairs.push({ group: "uncertain", dish: d.nameThai, profile: { favs: [], avoid: [{ name: "pork", reason: "dislike" }] }, expect: "check" });
}

const all = [...built, ...uncertainNames.flatMap((n) => buildDishes([{ name: n, price: 60 }], "u"))];
let missed = 0, falseConflict = 0, unexpectedCheckInControls = 0, uncertainTop = 0, wrong = 0;
const rows: string[] = [];
for (const p of pairs) {
  const d = all.find((x) => x.nameThai === p.dish)!;
  const got = categorizeDish(d, p.profile).status;
  const ok = p.expect === "not-top" ? got !== "top" : got === p.expect;
  if (!ok) wrong++;
  if (p.group === "conflict" && got !== "avoid") missed++;
  if (p.group === "control" && got === "avoid") falseConflict++;
  if (p.group === "control" && got === "check") unexpectedCheckInControls++;
  if (p.group === "uncertain" && p.expect === "not-top" && got === "top") uncertainTop++;
  rows.push(`${ok ? "PASS" : "FAIL"} ${p.group.padEnd(9)} ${p.dish} | avoid=${p.profile.avoid.map((a) => `${a.name}(${a.reason})`).join(",") || "-"} | expect ${p.expect} got ${got}`);
}
console.log(rows.join("\n"));
const c = (g: string) => pairs.filter((p) => p.group === g).length;
console.log(`\nSET conflict=${c("conflict")} control=${c("control")} uncertain=${c("uncertain")} total=${pairs.length}`);
console.log(`MISSED ${missed}/${c("conflict")}  FALSE_CONFLICT ${falseConflict}/${c("control")}  UNEXPECTED_CHECK_IN_CONTROLS ${unexpectedCheckInControls}  UNCERTAIN_TOP ${uncertainTop}  WRONG ${wrong}/${pairs.length}`);
