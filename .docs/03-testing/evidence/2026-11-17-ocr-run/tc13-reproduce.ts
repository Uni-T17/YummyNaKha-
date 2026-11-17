// TC13: rebuild the categories from the stored MenuAnalysis record alone
// (result.dishes + preferencesSnapshot) and compare with (a) what the browser showed
// for that scan and (b) the categories the CURRENT profile gives.
// Run from YummyNaKha_App: npx tsx --conditions=react-server --tsconfig tsconfig.json <this file> <record.json>
import { readFileSync } from "node:fs";
import { categorizeDish } from "@/lib/matching";

const rec = JSON.parse(readFileSync(process.argv[2], "utf8"));
const snap = rec.preferencesSnapshot;
const original = { favs: snap.favorites ?? [], avoid: snap.avoid ?? [], ...(snap.spice == null ? {} : { spice: snap.spice }) };
const current = { ...original, avoid: [...original.avoid, { name: "Shrimp", reason: "dislike" }] };

// Categories the browser rendered for this scan, copied from rendered-scan1.txt (before any profile change).
const shown: Record<string, string> = {
  "ผัดกะเพราหมูสับ": "top", "ข้าวผัดกุ้ง": "top", "ต้มยำกุ้ง": "top", "แกงเขียวหวานไก่": "top",
  "ไก่ผัดเม็ดมะม่วงหิมพานต์": "top", "ข้าวมันไก่": "top", "ผัดไทยกุ้งสด": "check", "ส้มตำไทย": "avoid",
};

let same = 0, changed = 0;
console.log(`record ${rec.id} · guide ${rec.model} · created ${rec.createdAt}`);
console.log(`snapshot ${JSON.stringify(snap)}`);
console.log("dish | shown | rebuilt from snapshot | with current profile");
for (const d of rec.result.dishes) {
  const fromSnap = categorizeDish(d, original).status;
  const now = categorizeDish(d, current).status;
  if (fromSnap === shown[d.nameThai]) same++;
  if (now !== fromSnap) changed++;
  console.log(`${d.nameThai} (${d.nameEn}) | ${shown[d.nameThai]} | ${fromSnap} | ${now}`);
}
console.log(`\nrebuilt == shown: ${same}/${rec.result.dishes.length}`);
console.log(`dishes whose category differs under the current profile: ${changed}`);
console.log(`category stored in record: ${rec.result.dishes.some((d: Record<string, unknown>) => "status" in d) ? "yes" : "no"}`);
