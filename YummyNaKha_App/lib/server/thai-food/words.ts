import "server-only";
import type { IngredientKey } from "./ingredients";

// Menu words for dishes that aren't in the guide. Thai dish names mostly
// describe the dish — หมึก (squid) + ทอด (deep-fried) + กระเทียม (garlic) — so
// reading the words gives an English name and the ingredients the name
// mentions. Cooking methods also carry the sauces they usually involve as
// "often added", so the allergy check stays cautious. A dish read this way is
// always Check First: its hidden sauces and seasonings are unknown.
//
// DRAFT DATA — to be reviewed by a Thai-literate team member before user testing.

export type WordKind =
  | "protein" // main meat / seafood / tofu (variants.ts)
  | "style" // a variation of the dish (variants.ts)
  | "method" // how it's cooked: "Stir-fried"
  | "dish" // what kind of dish: "curry"
  | "flavor" // sauce or seasoning: "garlic"
  | "ingredient" // vegetable, fruit, nut…
  | "base"; // rice or noodles it is served on

export interface MenuWord {
  th: string[];
  en: string;
  kind: WordKind;
  ingredients: IngredientKey[];
  /** Ingredients that are often but not always part of this word. */
  mayContain?: IngredientKey[];
  tags?: string[];
}

const STIR_FRY_SAUCES: IngredientKey[] = ["oyster sauce", "soy sauce", "fish sauce"];
const CURRY: IngredientKey[] = ["red curry paste", "shrimp paste", "coconut milk", "fish sauce"];

export const WORDS: MenuWord[] = [
  // ─── How it's cooked ─────────────────────────────────────────────────────
  { th: ["ผัด"], en: "Stir-fried", kind: "method", ingredients: ["cooking oil"], mayContain: [...STIR_FRY_SAUCES, "garlic"] },
  { th: ["ชุบแป้งทอด", "ชุบแป้ง"], en: "Battered and fried", kind: "method", ingredients: ["wheat flour", "cooking oil"], mayContain: ["egg"], tags: ["fried"] },
  { th: ["ทอดกรอบ", "กรอบ"], en: "Crispy fried", kind: "method", ingredients: ["cooking oil"], mayContain: ["wheat flour"], tags: ["fried"] },
  { th: ["ทอด"], en: "Deep-fried", kind: "method", ingredients: ["cooking oil"], mayContain: ["wheat flour"], tags: ["fried"] },
  { th: ["ย่าง", "ปิ้ง"], en: "Grilled", kind: "method", ingredients: [], mayContain: ["soy sauce", "oyster sauce", "fish sauce"], tags: ["grilled"] },
  { th: ["เผา"], en: "Charcoal-roasted", kind: "method", ingredients: [], tags: ["grilled"] },
  { th: ["นึ่ง"], en: "Steamed", kind: "method", ingredients: [], mayContain: ["soy sauce"], tags: ["steamed"] },
  { th: ["พะโล้"], en: "Five-spice braised", kind: "method", ingredients: ["five-spice", "dark soy sauce", "soy sauce"] },
  { th: ["ตุ๋น"], en: "Braised", kind: "method", ingredients: [], mayContain: ["soy sauce", "five-spice"] },
  { th: ["อบ"], en: "Baked", kind: "method", ingredients: [], mayContain: ["soy sauce", "butter"] },
  { th: ["ลวก"], en: "Blanched", kind: "method", ingredients: [] },
  { th: ["คั่ว"], en: "Dry-fried", kind: "method", ingredients: [], mayContain: STIR_FRY_SAUCES },
  { th: ["แดดเดียว"], en: "Sun-dried and fried", kind: "method", ingredients: ["cooking oil"], mayContain: ["fish sauce", "soy sauce"] },
  { th: ["เย็น"], en: "Iced", kind: "method", ingredients: [], tags: ["drink"] },
  { th: ["ร้อน"], en: "Hot", kind: "method", ingredients: [] },

  // ─── What kind of dish ───────────────────────────────────────────────────
  { th: ["แกง"], en: "curry", kind: "dish", ingredients: [], mayContain: CURRY, tags: ["curry"] },
  { th: ["ต้ม", "ซุป"], en: "soup", kind: "dish", ingredients: [], mayContain: ["fish sauce"], tags: ["soup"] },
  { th: ["น้ำพริก"], en: "chili dip", kind: "dish", ingredients: ["chili", "garlic"], mayContain: ["shrimp paste", "fish sauce", "lime"], tags: ["spicy"] },
  { th: ["สลัด"], en: "salad", kind: "dish", ingredients: [], mayContain: ["mayonnaise"], tags: ["salad"] },
  // Its own word so นม (milk) isn't read inside ขนม; ขนมจีน / ขนมปัง still win as longer matches.
  { th: ["ขนม"], en: "Thai dessert", kind: "dish", ingredients: [], mayContain: ["coconut milk", "sugar"], tags: ["dessert", "sweet"] },
  { th: ["ปั่น"], en: "smoothie", kind: "dish", ingredients: [], mayContain: ["sugar"], tags: ["drink"] },

  // ─── Sauces & seasonings ─────────────────────────────────────────────────
  { th: ["กระเทียมพริกไทย"], en: "garlic & pepper", kind: "flavor", ingredients: ["garlic", "pepper"] },
  { th: ["กระเทียม"], en: "garlic", kind: "flavor", ingredients: ["garlic"] },
  { th: ["พริกไทยดำ", "พริกไทย"], en: "black pepper", kind: "flavor", ingredients: ["pepper"] },
  { th: ["พริกไทยอ่อน"], en: "green peppercorns", kind: "flavor", ingredients: ["pepper"] },
  { th: ["พริกเกลือ"], en: "salt & chili", kind: "flavor", ingredients: ["salt", "chili", "garlic"], tags: ["spicy"] },
  { th: ["น้ำพริกเผา", "พริกเผา"], en: "roasted chili paste", kind: "flavor", ingredients: ["roasted chili paste"] },
  { th: ["พริกแกง"], en: "red curry paste", kind: "flavor", ingredients: ["red curry paste", "shrimp paste"], tags: ["spicy"] },
  { th: ["พริก"], en: "chili", kind: "flavor", ingredients: ["chili"], tags: ["spicy"] },
  { th: ["ขิง"], en: "ginger", kind: "flavor", ingredients: ["ginger"] },
  { th: ["ตะไคร้"], en: "lemongrass", kind: "flavor", ingredients: ["lemongrass"] },
  { th: ["มะนาว"], en: "lime", kind: "flavor", ingredients: ["lime"], tags: ["sour"] },
  { th: ["น้ำปลา"], en: "fish sauce", kind: "flavor", ingredients: ["fish sauce"] },
  { th: ["น้ำมันหอย", "ซอสหอยนางรม"], en: "oyster sauce", kind: "flavor", ingredients: ["oyster sauce"] },
  { th: ["ซีอิ๊ว", "ซีอิ้ว", "ซอสถั่วเหลือง"], en: "soy sauce", kind: "flavor", ingredients: ["soy sauce"] },
  { th: ["เต้าเจี้ยว"], en: "soybean paste", kind: "flavor", ingredients: ["fermented soybean paste"] },
  { th: ["ปลาร้า", "ปลาแดก"], en: "fermented fish sauce", kind: "flavor", ingredients: ["fermented fish sauce"] },
  { th: ["กะปิ"], en: "shrimp paste", kind: "flavor", ingredients: ["shrimp paste"] },
  { th: ["ผงกะหรี่"], en: "curry powder", kind: "flavor", ingredients: ["curry powder"] },
  { th: ["ซอสมะขาม", "มะขาม"], en: "tamarind sauce", kind: "flavor", ingredients: ["tamarind"], tags: ["sour", "sweet"] },
  { th: ["สามรส"], en: "three-flavour sauce", kind: "flavor", ingredients: ["chili", "palm sugar", "tamarind", "fish sauce"], tags: ["sweet", "sour", "spicy"] },
  { th: ["น้ำจิ้มซีฟู้ด"], en: "seafood dipping sauce", kind: "flavor", ingredients: ["chili", "garlic", "lime", "fish sauce"], tags: ["spicy"] },
  { th: ["น้ำจิ้มแจ่ว", "แจ่ว"], en: "jaew dipping sauce", kind: "flavor", ingredients: ["chili", "toasted rice powder", "fish sauce"], tags: ["spicy"] },
  { th: ["น้ำจิ้มไก่"], en: "sweet chili sauce", kind: "flavor", ingredients: ["sweet chili sauce"] },
  { th: ["กะทิ"], en: "coconut milk", kind: "flavor", ingredients: ["coconut milk"], tags: ["coconut"] },
  { th: ["ขมิ้น"], en: "turmeric", kind: "flavor", ingredients: ["turmeric"] },
  { th: ["งาขาว", "งาดำ", "งาคั่ว"], en: "sesame", kind: "flavor", ingredients: ["sesame"] },
  { th: ["เนยกระเทียม"], en: "garlic butter", kind: "flavor", ingredients: ["butter", "garlic"] },
  { th: ["เนย"], en: "butter", kind: "flavor", ingredients: ["butter"] },
  { th: ["ชีส"], en: "cheese", kind: "flavor", ingredients: ["cheese"] },
  { th: ["มายองเนส"], en: "mayonnaise", kind: "flavor", ingredients: ["mayonnaise"] },
  { th: ["ใบกะเพรา", "กะเพรา", "กระเพรา"], en: "holy basil", kind: "flavor", ingredients: ["holy basil"], tags: ["spicy"] },
  { th: ["สมุนไพร"], en: "herbs", kind: "flavor", ingredients: [], mayContain: ["lemongrass", "kaffir lime leaves", "galangal"] },
  { th: ["น้ำจิ้ม", "จิ้ม"], en: "dipping sauce", kind: "flavor", ingredients: ["chili"], mayContain: ["fish sauce", "garlic", "lime"], tags: ["spicy"] },
  { th: ["น้ำมันงา"], en: "sesame oil", kind: "flavor", ingredients: ["sesame oil"] },
  { th: ["โหระพา"], en: "Thai basil", kind: "flavor", ingredients: ["thai basil"] },
  { th: ["ใบมะกรูด"], en: "kaffir lime leaves", kind: "flavor", ingredients: ["kaffir lime leaves"] },

  // ─── Vegetables, fruit, nuts ─────────────────────────────────────────────
  { th: ["เห็ดหอม", "เห็ดเข็มทอง", "เห็ดฟาง", "เห็ด"], en: "mushrooms", kind: "ingredient", ingredients: ["mushroom"] },
  { th: ["หน่อไม้"], en: "bamboo shoots", kind: "ingredient", ingredients: ["bamboo shoots"] },
  { th: ["ถั่วงอก"], en: "bean sprouts", kind: "ingredient", ingredients: ["bean sprouts"] },
  { th: ["ถั่วฝักยาว"], en: "long beans", kind: "ingredient", ingredients: ["long beans"] },
  { th: ["ถั่วพู"], en: "winged beans", kind: "ingredient", ingredients: ["winged beans"] },
  { th: ["ถั่วลิสง"], en: "peanuts", kind: "ingredient", ingredients: ["peanut"] },
  { th: ["เม็ดมะม่วงหิมพานต์", "เม็ดมะม่วง"], en: "cashew nuts", kind: "ingredient", ingredients: ["cashew nut"] },
  { th: ["สะตอ"], en: "stink beans", kind: "ingredient", ingredients: ["stink beans"] },
  { th: ["คะน้า"], en: "Chinese kale", kind: "ingredient", ingredients: ["chinese kale"] },
  { th: ["ผักบุ้ง"], en: "morning glory", kind: "ingredient", ingredients: ["morning glory"] },
  { th: ["บรอกโคลี", "บร็อคโคลี่", "บรอคโคลี่"], en: "broccoli", kind: "ingredient", ingredients: ["broccoli"] },
  { th: ["กะหล่ำดอก"], en: "cauliflower", kind: "ingredient", ingredients: ["cauliflower"] },
  { th: ["กะหล่ำปลี", "กะหล่ำ", "กระหล่ำปลี", "กระหล่ำ"], en: "cabbage", kind: "ingredient", ingredients: ["cabbage"] },
  { th: ["ข้าวโพดอ่อน"], en: "baby corn", kind: "ingredient", ingredients: ["baby corn"] },
  { th: ["ข้าวโพด"], en: "corn", kind: "ingredient", ingredients: ["corn"] },
  { th: ["แครอท"], en: "carrot", kind: "ingredient", ingredients: ["carrot"] },
  { th: ["พริกหยวก"], en: "bell pepper", kind: "ingredient", ingredients: ["bell pepper"] },
  { th: ["มะเขือเทศ"], en: "tomato", kind: "ingredient", ingredients: ["tomato"] },
  { th: ["มะเขือยาว", "มะเขือ"], en: "eggplant", kind: "ingredient", ingredients: ["eggplant"] },
  { th: ["แตงกวา"], en: "cucumber", kind: "ingredient", ingredients: ["cucumber"] },
  { th: ["มะระ"], en: "bitter melon", kind: "ingredient", ingredients: ["bitter melon"] },
  { th: ["ฟักทอง"], en: "pumpkin", kind: "ingredient", ingredients: ["pumpkin"] },
  { th: ["เผือก"], en: "taro", kind: "ingredient", ingredients: ["taro"] },
  { th: ["ชะอม"], en: "acacia leaves", kind: "ingredient", ingredients: ["acacia leaves"] },
  { th: ["กุยช่าย"], en: "Chinese chives", kind: "ingredient", ingredients: ["chinese chives"] },
  { th: ["หอมใหญ่"], en: "onion", kind: "ingredient", ingredients: ["onion"] },
  { th: ["ต้นหอม"], en: "spring onion", kind: "ingredient", ingredients: ["spring onion"] },
  { th: ["ผักชี"], en: "coriander", kind: "ingredient", ingredients: ["coriander"] },
  { th: ["สับปะรด"], en: "pineapple", kind: "ingredient", ingredients: ["pineapple"] },
  { th: ["มะม่วง"], en: "mango", kind: "ingredient", ingredients: ["mango"] },
  { th: ["มะละกอ"], en: "papaya", kind: "ingredient", ingredients: ["green papaya"] },
  { th: ["ส้มโอ"], en: "pomelo", kind: "ingredient", ingredients: ["pomelo"] },
  { th: ["แตงโม"], en: "watermelon", kind: "ingredient", ingredients: ["watermelon"] },
  { th: ["มะพร้าว"], en: "coconut", kind: "ingredient", ingredients: ["coconut"] },
  { th: ["กล้วย"], en: "banana", kind: "ingredient", ingredients: ["banana"] },
  { th: ["ลำไย"], en: "longan", kind: "ingredient", ingredients: ["longan"] },
  { th: ["กระเจี๊ยบ"], en: "roselle", kind: "ingredient", ingredients: ["roselle"] },
  { th: ["ขนุน"], en: "jackfruit", kind: "ingredient", ingredients: ["jackfruit"] },
  { th: ["น้ำส้ม", "ส้ม"], en: "orange", kind: "ingredient", ingredients: ["orange"] },
  { th: ["สังขยา"], en: "custard", kind: "ingredient", ingredients: ["egg", "coconut milk", "sugar"], tags: ["sweet"] },
  { th: ["ชาเขียว"], en: "green tea", kind: "ingredient", ingredients: ["green tea"], mayContain: ["milk", "sweetened condensed milk"] },
  { th: ["ชา"], en: "tea", kind: "ingredient", ingredients: ["tea"], mayContain: ["sweetened condensed milk"] },
  { th: ["กาแฟ"], en: "coffee", kind: "ingredient", ingredients: ["coffee"], mayContain: ["sweetened condensed milk", "evaporated milk"] },
  { th: ["โกโก้", "ช็อกโกแลต", "ช็อคโกแลต"], en: "cocoa", kind: "ingredient", ingredients: ["cocoa"], mayContain: ["milk", "sweetened condensed milk"] },
  { th: ["นมสด", "นม"], en: "milk", kind: "ingredient", ingredients: ["milk"] },
  { th: ["น้ำอัดลม", "โค้ก", "เป๊ปซี่", "สไปรท์"], en: "soft drink", kind: "ingredient", ingredients: ["soft drink"], tags: ["drink"] },
  { th: ["เบียร์"], en: "beer", kind: "ingredient", ingredients: ["beer"], tags: ["drink"] },
  { th: ["เหล้าขาว", "เหล้า", "แสงโสม", "หงส์ทอง", "รีเจนซี่"], en: "Thai spirits", kind: "ingredient", ingredients: ["spirits"], tags: ["drink"] },
  { th: ["โซดา"], en: "soda water", kind: "ingredient", ingredients: [], tags: ["drink"] },

  // ─── Served on / with ────────────────────────────────────────────────────
  { th: ["ข้าวเหนียว"], en: "sticky rice", kind: "base", ingredients: ["sticky rice"] },
  { th: ["ข้าวสวย", "ข้าว"], en: "rice", kind: "base", ingredients: ["rice"], tags: ["rice"] },
  { th: ["เส้นเล็ก", "เส้นใหญ่", "เส้นก๋วยเตี๋ยว"], en: "rice noodles", kind: "base", ingredients: ["rice noodles"], tags: ["noodle"] },
  { th: ["เส้นหมี่", "หมี่"], en: "rice vermicelli", kind: "base", ingredients: ["rice vermicelli"], tags: ["noodle"] },
  { th: ["บะหมี่"], en: "egg noodles", kind: "base", ingredients: ["egg noodles"], tags: ["noodle"] },
  { th: ["วุ้นเส้น"], en: "glass noodles", kind: "base", ingredients: ["glass noodles"], tags: ["noodle"] },
  { th: ["มาม่า"], en: "instant noodles", kind: "base", ingredients: ["instant noodles"], tags: ["noodle"] },
  { th: ["ขนมจีน"], en: "fermented rice noodles", kind: "base", ingredients: ["fermented rice noodles"], tags: ["noodle"] },
  { th: ["ขนมปัง"], en: "bread", kind: "base", ingredients: ["bread"] },
];
