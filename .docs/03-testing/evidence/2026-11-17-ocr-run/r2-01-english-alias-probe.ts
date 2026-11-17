// R2-01 probe: what does the dish guide return for English menu lines containing "chocolate"?
// Run from YummyNaKha_App: npx tsx --conditions=react-server --tsconfig tsconfig.json <this file>
import { buildDishes } from "@/lib/server/menu/build-dishes";
import { categorizeDish } from "@/lib/matching";

const lines = ["Chocolate Shake", "Chocolate Lava Cake", "Chocolate Croissant", "Iced Chocolate", "โกโก้เย็น"];
for (const name of lines) {
  const [d] = buildDishes([{ name, price: 90 }], "probe") as any[];
  const status = categorizeDish(d, { favs: [], avoid: [] }).status;
  console.log(`${name} → ${d.nameEn} / ${d.nameThai} · inGuide=${d.inGuide} · uncertainties=${(d.uncertainties ?? []).length} · category=${status}`);
}
