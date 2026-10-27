import "server-only";
import type { MenuWord } from "./words";

// Words added to a base dish name on Thai menus: the protein (ผัดกะเพรา + หมูสับ)
// or a style (ต้มยำ + น้ำข้น). Found in whatever is left of the menu line after
// the base dish name is removed. Longer spellings are tried first, so หมูสับ
// wins over หมู.
//
// DRAFT DATA — to be reviewed by a Thai-literate team member before user testing.

export type Variant = MenuWord & { kind: "protein" | "style" };

export const VARIANTS: Variant[] = [
  { th: ["หมูสับ"], en: "minced pork", kind: "protein", ingredients: ["minced pork"] },
  { th: ["หมูสามชั้น", "สามชั้น"], en: "pork belly", kind: "protein", ingredients: ["pork"] },
  { th: ["ซี่โครงหมู", "ซี่โครง"], en: "pork ribs", kind: "protein", ingredients: ["pork"] },
  { th: ["คอหมู"], en: "pork neck", kind: "protein", ingredients: ["pork"] },
  { th: ["ตับหมู", "ตับ", "เครื่องใน"], en: "pork offal", kind: "protein", ingredients: ["pork offal"] },
  { th: ["เลือดหมู"], en: "pork blood", kind: "protein", ingredients: ["pork blood"] },
  { th: ["กระดูกอ่อน"], en: "pork cartilage", kind: "protein", ingredients: ["pork"] },
  { th: ["หมูยอ"], en: "Thai pork sausage", kind: "protein", ingredients: ["pork sausage"] },
  { th: ["กุนเชียง"], en: "Chinese sausage", kind: "protein", ingredients: ["chinese sausage"] },
  { th: ["แหนม"], en: "fermented pork", kind: "protein", ingredients: ["fermented pork"] },
  { th: ["ไส้กรอก"], en: "sausage", kind: "protein", ingredients: ["sausage"] },
  { th: ["แคบหมู"], en: "pork crackling", kind: "protein", ingredients: ["pork crackling"] },
  { th: ["หมูกรอบ"], en: "crispy pork belly", kind: "protein", ingredients: ["crispy pork belly"] },
  { th: ["หมูแดง"], en: "red roast pork", kind: "protein", ingredients: ["red roast pork"] },
  { th: ["หมู"], en: "pork", kind: "protein", ingredients: ["pork"] },
  { th: ["ปีกไก่"], en: "chicken wings", kind: "protein", ingredients: ["chicken"] },
  { th: ["น่องไก่"], en: "chicken drumsticks", kind: "protein", ingredients: ["chicken"] },
  { th: ["อกไก่"], en: "chicken breast", kind: "protein", ingredients: ["chicken"] },
  { th: ["ไก่"], en: "chicken", kind: "protein", ingredients: ["chicken"] },
  { th: ["เนื้อวัว", "เนื้อ"], en: "beef", kind: "protein", ingredients: ["beef"] },
  { th: ["เป็ดย่าง"], en: "roast duck", kind: "protein", ingredients: ["duck"] },
  { th: ["เป็ด"], en: "duck", kind: "protein", ingredients: ["duck"] },
  { th: ["กุ้งแม่น้ำ"], en: "river prawns", kind: "protein", ingredients: ["shrimp"] },
  { th: ["กุ้งสด", "กุ้ง"], en: "shrimp", kind: "protein", ingredients: ["shrimp"] },
  { th: ["ปลาหมึก", "หมึก"], en: "squid", kind: "protein", ingredients: ["squid"] },
  {
    th: ["ทะเล", "ซีฟู้ด", "รวมมิตรทะเล"],
    en: "mixed seafood",
    kind: "protein",
    ingredients: ["shrimp", "squid"],
    mayContain: ["mussel", "fish", "crab"],
    tags: ["seafood"],
  },
  { th: ["เนื้อปู"], en: "crab meat", kind: "protein", ingredients: ["crab"] },
  { th: ["ปูนิ่ม", "ปู"], en: "crab", kind: "protein", ingredients: ["crab"] },
  { th: ["ปลากะพง"], en: "sea bass", kind: "protein", ingredients: ["sea bass"] },
  { th: ["ปลาดุก"], en: "catfish", kind: "protein", ingredients: ["catfish"] },
  { th: ["ปลาทู"], en: "mackerel", kind: "protein", ingredients: ["mackerel"] },
  { th: ["ปลานิล", "ปลาทับทิม"], en: "tilapia", kind: "protein", ingredients: ["fish"] },
  { th: ["ปลาช่อน"], en: "snakehead fish", kind: "protein", ingredients: ["fish"] },
  { th: ["ปลาแซลมอน", "แซลมอน"], en: "salmon", kind: "protein", ingredients: ["fish"] },
  { th: ["ปลา"], en: "fish", kind: "protein", ingredients: ["fish"] },
  { th: ["หอยแมลงภู่"], en: "mussels", kind: "protein", ingredients: ["mussel"] },
  { th: ["หอยนางรม"], en: "oysters", kind: "protein", ingredients: ["oyster"] },
  { th: ["หอยลาย", "หอยแครง", "หอยหลอด"], en: "clams", kind: "protein", ingredients: ["clams"] },
  { th: ["หอย"], en: "shellfish", kind: "protein", ingredients: ["clams"] },
  { th: ["ไข่ดาว"], en: "fried egg", kind: "style", ingredients: ["fried egg"] },
  { th: ["ไข่ต้ม"], en: "boiled egg", kind: "protein", ingredients: ["egg"] },
  { th: ["แมงกะพรุน", "แมงกระพรุน"], en: "jellyfish", kind: "protein", ingredients: ["jellyfish"] },
  { th: ["ไข่เค็ม"], en: "salted egg", kind: "style", ingredients: ["egg"] },
  { th: ["ไข่เจียว"], en: "omelette", kind: "protein", ingredients: ["egg"] },
  { th: ["ไข่"], en: "egg", kind: "protein", ingredients: ["egg"] },
  { th: ["เต้าหู้"], en: "tofu", kind: "protein", ingredients: ["tofu"], tags: ["veggie"] },
  { th: ["ผักรวม", "ผัก"], en: "vegetables", kind: "protein", ingredients: ["mixed vegetables"], tags: ["veggie"] },
  { th: ["อาหารเจ", "มังสวิรัติ"], en: "vegetarian", kind: "style", ingredients: [], tags: ["vegetarian", "veggie"] },
  { th: ["น้ำข้น"], en: "creamy", kind: "style", ingredients: ["evaporated milk"], mayContain: ["roasted chili paste"] },
  { th: ["น้ำใส"], en: "clear broth", kind: "style", ingredients: [] },
  // Cut of meat on made-to-order menus (หมูชิ้น, ไก่สับ) — read so they don't count as unknown text.
  { th: ["ชิ้น"], en: "sliced", kind: "style", ingredients: [] },
  { th: ["สับ"], en: "minced", kind: "style", ingredients: [] },
];
