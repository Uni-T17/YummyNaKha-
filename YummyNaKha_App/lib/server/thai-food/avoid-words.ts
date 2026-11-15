import "server-only";
import { normalizeTerm } from "@/lib/matching";
import { INGREDIENTS } from "./ingredients";

// Thai words for what a diner puts on their Avoid list, so the Order in Thai
// page can ask staff about it ("ฉันแพ้ถั่วลิสง"). An exact ingredient from the
// guide wins; otherwise the group words a diner is likely to type
// ("shellfish", "dairy") are looked up below.
//
// DRAFT DATA — to be reviewed by a Thai-literate team member before user testing.

const GROUP_WORDS: Record<string, string> = {
  seafood: "อาหารทะเล",
  shellfish: "อาหารทะเลที่มีเปลือก เช่น กุ้ง ปู หอย",
  crustacean: "กุ้งและปู",
  mollusc: "หอยและปลาหมึก",
  prawn: "กุ้ง",
  meat: "เนื้อสัตว์",
  "red meat": "เนื้อแดง",
  poultry: "เนื้อสัตว์ปีก",
  dairy: "นมและผลิตภัณฑ์จากนม",
  lactose: "แล็กโทส (นม)",
  gluten: "กลูเตน (แป้งสาลี)",
  wheat: "แป้งสาลี",
  soy: "ถั่วเหลือง",
  nut: "ถั่ว",
  nuts: "ถั่ว",
  "tree nut": "ถั่วเปลือกแข็ง",
  alcohol: "แอลกอฮอล์",
  caffeine: "คาเฟอีน",
  msg: "ผงชูรส",
  "monosodium glutamate": "ผงชูรส",
  cilantro: "ผักชี",
  spice: "เครื่องเทศ",
  offal: "เครื่องใน",
  blood: "เลือด",
};

const BY_KEY = new Map(Object.entries(INGREDIENTS).map(([key, info]) => [normalizeTerm(key), info.th]));
const BY_GROUP = new Map(Object.entries(GROUP_WORDS).map(([word, th]) => [normalizeTerm(word), th]));

/** Thai for an Avoid-list word, or undefined when we don't know it yet. Thai input is returned as typed. */
export function thaiAvoidWord(name: string): string | undefined {
  if (/[ก-๛]/.test(name)) return name.trim();
  const key = normalizeTerm(name);
  return BY_KEY.get(key) ?? BY_GROUP.get(key);
}
