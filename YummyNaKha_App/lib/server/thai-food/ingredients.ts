import "server-only";

// Ingredient catalog for the Thai dish guide. `groups` are the words a diner
// might put on their Avoid list that this ingredient belongs to, so "shellfish"
// catches shrimp paste and oyster sauce, and "gluten" catches soy sauce.
// Keys are lower-case English and are what the dish data refers to.
//
// DRAFT DATA — to be reviewed by a Thai-literate team member before user testing.

export interface IngredientInfo {
  th: string;
  groups: string[];
}

const SEAFOOD_SHELLFISH = ["shellfish", "crustacean", "seafood"];
const SEAFOOD_MOLLUSC = ["shellfish", "mollusc", "seafood"];
const SOY_WHEAT = ["soy", "wheat", "gluten"];

export const INGREDIENTS = {
  // Meat & poultry
  pork: { th: "หมู", groups: ["pork", "meat"] },
  "minced pork": { th: "หมูสับ", groups: ["pork", "meat"] },
  "crispy pork belly": { th: "หมูกรอบ", groups: ["pork", "meat"] },
  "red roast pork": { th: "หมูแดง", groups: ["pork", "meat"] },
  "pork blood": { th: "เลือดหมู", groups: ["pork", "blood", "meat"] },
  "pork offal": { th: "เครื่องในหมู", groups: ["pork", "offal", "meat"] },
  "pork fat": { th: "มันหมู", groups: ["pork", "meat"] },
  sausage: { th: "ไส้กรอก", groups: ["pork", "meat"] },
  chicken: { th: "ไก่", groups: ["chicken", "poultry", "meat"] },
  "chicken broth": { th: "น้ำซุปไก่", groups: ["chicken", "poultry", "meat"] },
  "pork broth": { th: "น้ำซุปกระดูกหมู", groups: ["pork", "meat"] },
  beef: { th: "เนื้อวัว", groups: ["beef", "red meat", "meat"] },
  duck: { th: "เป็ด", groups: ["duck", "poultry", "meat"] },

  // Fish & seafood
  fish: { th: "ปลา", groups: ["fish", "seafood"] },
  "sea bass": { th: "ปลากะพง", groups: ["fish", "seafood"] },
  catfish: { th: "ปลาดุก", groups: ["fish", "seafood"] },
  "fish balls": { th: "ลูกชิ้นปลา", groups: ["fish", "seafood"] },
  "fish sauce": { th: "น้ำปลา", groups: ["fish", "seafood"] },
  "fermented fish sauce": { th: "ปลาร้า", groups: ["fish", "seafood"] },
  shrimp: { th: "กุ้ง", groups: ["shrimp", "prawn", ...SEAFOOD_SHELLFISH] },
  "dried shrimp": { th: "กุ้งแห้ง", groups: ["shrimp", "prawn", ...SEAFOOD_SHELLFISH] },
  "shrimp paste": { th: "กะปิ", groups: ["shrimp", "prawn", ...SEAFOOD_SHELLFISH] },
  crab: { th: "ปู", groups: ["crab", ...SEAFOOD_SHELLFISH] },
  "salted crab": { th: "ปูดอง", groups: ["crab", ...SEAFOOD_SHELLFISH] },
  squid: { th: "ปลาหมึก", groups: ["squid", ...SEAFOOD_MOLLUSC] },
  mussel: { th: "หอยแมลงภู่", groups: ["mussel", ...SEAFOOD_MOLLUSC] },
  oyster: { th: "หอยนางรม", groups: ["oyster", ...SEAFOOD_MOLLUSC] },
  clams: { th: "หอย", groups: ["clam", ...SEAFOOD_MOLLUSC] },
  "oyster sauce": { th: "น้ำมันหอย", groups: ["oyster", ...SEAFOOD_MOLLUSC, ...SOY_WHEAT] },
  "roasted chili paste": { th: "น้ำพริกเผา", groups: ["chili", "shrimp", ...SEAFOOD_SHELLFISH] },

  // Egg & dairy
  egg: { th: "ไข่", groups: ["egg"] },
  "fried egg": { th: "ไข่ดาว", groups: ["egg"] },
  milk: { th: "นม", groups: ["milk", "dairy", "lactose"] },
  "evaporated milk": { th: "นมข้นจืด", groups: ["milk", "dairy", "lactose"] },
  "sweetened condensed milk": { th: "นมข้นหวาน", groups: ["milk", "dairy", "lactose"] },

  // Nuts, seeds, soy, wheat
  peanut: { th: "ถั่วลิสง", groups: ["peanut", "nuts"] },
  "cashew nut": { th: "เม็ดมะม่วงหิมพานต์", groups: ["cashew", "tree nut", "nuts"] },
  sesame: { th: "งา", groups: ["sesame", "seeds"] },
  "sesame oil": { th: "น้ำมันงา", groups: ["sesame", "seeds", "oil"] },
  tofu: { th: "เต้าหู้", groups: ["soy", "tofu"] },
  "soy sauce": { th: "ซีอิ๊ว", groups: SOY_WHEAT },
  "dark soy sauce": { th: "ซีอิ๊วดำ", groups: SOY_WHEAT },
  "fermented soybean paste": { th: "เต้าเจี้ยว", groups: SOY_WHEAT },
  "fermented red bean curd": { th: "เต้าหู้ยี้", groups: ["soy"] },
  "wheat flour": { th: "แป้งสาลี", groups: ["wheat", "gluten"] },
  "egg noodles": { th: "บะหมี่", groups: ["wheat", "gluten", "egg", "noodle"] },
  "instant noodles": { th: "บะหมี่กึ่งสำเร็จรูป", groups: ["wheat", "gluten", "noodle"] },

  // Rice & starches
  rice: { th: "ข้าว", groups: ["rice"] },
  "sticky rice": { th: "ข้าวเหนียว", groups: ["rice", "sticky rice"] },
  "rice noodles": { th: "เส้นก๋วยเตี๋ยว", groups: ["rice", "noodle"] },
  "wide rice noodles": { th: "เส้นใหญ่", groups: ["rice", "noodle"] },
  "glass noodles": { th: "วุ้นเส้น", groups: ["mung bean", "noodle"] },
  "glutinous rice flour": { th: "แป้งข้าวเหนียว", groups: ["rice"] },
  "toasted rice powder": { th: "ข้าวคั่ว", groups: ["rice"] },
  "tapioca starch": { th: "แป้งมัน", groups: ["tapioca"] },
  potato: { th: "มันฝรั่ง", groups: ["potato"] },

  // Curry pastes, sauces, seasonings
  "green curry paste": { th: "พริกแกงเขียวหวาน", groups: ["chili", "curry paste"] },
  "red curry paste": { th: "พริกแกงเผ็ด", groups: ["chili", "curry paste"] },
  "massaman curry paste": { th: "พริกแกงมัสมั่น", groups: ["chili", "curry paste"] },
  "sour curry paste": { th: "พริกแกงส้ม", groups: ["chili", "curry paste"] },
  "curry powder": { th: "ผงกะหรี่", groups: ["curry powder", "spice"] },
  "coconut milk": { th: "กะทิ", groups: ["coconut"] },
  "tomato sauce": { th: "ซอสมะเขือเทศ", groups: ["tomato"] },
  "sweet chili sauce": { th: "น้ำจิ้มไก่", groups: ["chili", "sugar"] },
  "chili sauce": { th: "ซอสพริก", groups: ["chili"] },
  vinegar: { th: "น้ำส้มสายชู", groups: ["vinegar"] },
  tamarind: { th: "มะขาม", groups: ["tamarind"] },
  "palm sugar": { th: "น้ำตาลปี๊บ", groups: ["sugar"] },
  sugar: { th: "น้ำตาล", groups: ["sugar"] },
  "cooking oil": { th: "น้ำมัน", groups: ["oil"] },
  pepper: { th: "พริกไทย", groups: ["pepper"] },

  // Herbs & aromatics
  chili: { th: "พริก", groups: ["chili", "spicy"] },
  garlic: { th: "กระเทียม", groups: ["garlic"] },
  shallot: { th: "หอมแดง", groups: ["shallot", "onion"] },
  onion: { th: "หอมใหญ่", groups: ["onion"] },
  "spring onion": { th: "ต้นหอม", groups: ["spring onion", "onion"] },
  "holy basil": { th: "กะเพรา", groups: ["basil", "herb"] },
  "thai basil": { th: "โหระพา", groups: ["basil", "herb"] },
  mint: { th: "สะระแหน่", groups: ["mint", "herb"] },
  coriander: { th: "ผักชี", groups: ["coriander", "cilantro", "herb"] },
  lemongrass: { th: "ตะไคร้", groups: ["lemongrass", "herb"] },
  galangal: { th: "ข่า", groups: ["galangal"] },
  ginger: { th: "ขิง", groups: ["ginger"] },
  "kaffir lime leaves": { th: "ใบมะกรูด", groups: ["lime leaf", "herb"] },
  lime: { th: "มะนาว", groups: ["lime", "citrus"] },

  // Vegetables & fruit
  "mixed vegetables": { th: "ผักรวม", groups: ["vegetable"] },
  "chinese kale": { th: "คะน้า", groups: ["vegetable", "kale"] },
  "morning glory": { th: "ผักบุ้ง", groups: ["vegetable", "morning glory"] },
  "bean sprouts": { th: "ถั่วงอก", groups: ["bean sprouts", "vegetable"] },
  "long beans": { th: "ถั่วฝักยาว", groups: ["beans", "vegetable"] },
  eggplant: { th: "มะเขือ", groups: ["eggplant", "aubergine", "vegetable"] },
  mushroom: { th: "เห็ด", groups: ["mushroom"] },
  tomato: { th: "มะเขือเทศ", groups: ["tomato"] },
  cucumber: { th: "แตงกวา", groups: ["cucumber", "vegetable"] },
  "bitter melon": { th: "มะระ", groups: ["bitter melon", "vegetable"] },
  "pickled mustard greens": { th: "ผักกาดดอง", groups: ["vegetable"] },
  "green papaya": { th: "มะละกอ", groups: ["papaya"] },
  "green mango": { th: "มะม่วงดิบ", groups: ["mango"] },
  mango: { th: "มะม่วง", groups: ["mango"] },
  pineapple: { th: "สับปะรด", groups: ["pineapple"] },
  banana: { th: "กล้วย", groups: ["banana"] },
  "water chestnut": { th: "แห้ว", groups: ["water chestnut"] },
  raisins: { th: "ลูกเกด", groups: ["raisin", "grape"] },
  coconut: { th: "มะพร้าว", groups: ["coconut"] },

  // More meat & fish (regional and Chinese-Thai dishes)
  "chinese sausage": { th: "กุนเชียง", groups: ["pork", "meat"] },
  "fermented pork": { th: "แหนม", groups: ["pork", "meat"] },
  "pork sausage": { th: "หมูยอ", groups: ["pork", "meat"] },
  "isan sausage": { th: "ไส้กรอกอีสาน", groups: ["pork", "meat", "rice"] },
  "northern sausage": { th: "ไส้อั่ว", groups: ["pork", "meat"] },
  "pork crackling": { th: "แคบหมู", groups: ["pork", "meat"] },
  mackerel: { th: "ปลาทู", groups: ["fish", "seafood"] },
  "fish innards": { th: "ไตปลา", groups: ["fish", "seafood"] },
  jellyfish: { th: "แมงกะพรุน", groups: ["jellyfish", "seafood"] },

  // More dairy, eggs, wheat
  butter: { th: "เนย", groups: ["butter", "milk", "dairy", "lactose"] },
  cheese: { th: "ชีส", groups: ["cheese", "milk", "dairy", "lactose"] },
  "ice cream": { th: "ไอศกรีม", groups: ["milk", "dairy", "lactose"] },
  mayonnaise: { th: "มายองเนส", groups: ["egg"] },
  bread: { th: "ขนมปัง", groups: ["wheat", "gluten"] },
  beer: { th: "เบียร์", groups: ["alcohol", "wheat", "gluten"] },
  spirits: { th: "เหล้า", groups: ["alcohol"] },

  // More starches & noodles
  "rice flour": { th: "แป้งข้าวเจ้า", groups: ["rice"] },
  "rice vermicelli": { th: "เส้นหมี่", groups: ["rice", "noodle"] },
  "fermented rice noodles": { th: "ขนมจีน", groups: ["rice", "noodle"] },
  "rolled rice noodles": { th: "เส้นก๋วยจั๊บ", groups: ["rice", "noodle"] },
  taro: { th: "เผือก", groups: ["taro"] },
  pumpkin: { th: "ฟักทอง", groups: ["pumpkin"] },
  "grass jelly": { th: "เฉาก๊วย", groups: ["grass jelly"] },

  // More seasonings
  salt: { th: "เกลือ", groups: ["salt"] },
  turmeric: { th: "ขมิ้น", groups: ["turmeric"] },
  "five-spice": { th: "ผงพะโล้", groups: ["spice"] },
  "yellow curry paste": { th: "พริกแกงเหลือง", groups: ["chili", "curry paste", "turmeric"] },
  pandan: { th: "ใบเตย", groups: ["pandan"] },
  cocoa: { th: "โกโก้", groups: ["cocoa", "chocolate", "caffeine"] },

  // More vegetables & fruit
  "bamboo shoots": { th: "หน่อไม้", groups: ["bamboo shoot", "vegetable"] },
  "winged beans": { th: "ถั่วพู", groups: ["beans", "vegetable"] },
  "stink beans": { th: "สะตอ", groups: ["beans", "vegetable"] },
  "chinese chives": { th: "กุยช่าย", groups: ["chives", "vegetable"] },
  "acacia leaves": { th: "ชะอม", groups: ["vegetable"] },
  broccoli: { th: "บรอกโคลี", groups: ["vegetable"] },
  cauliflower: { th: "กะหล่ำดอก", groups: ["vegetable"] },
  cabbage: { th: "กะหล่ำปลี", groups: ["cabbage", "vegetable"] },
  "bell pepper": { th: "พริกหยวก", groups: ["capsicum", "vegetable"] },
  "baby corn": { th: "ข้าวโพดอ่อน", groups: ["corn", "vegetable"] },
  corn: { th: "ข้าวโพด", groups: ["corn"] },
  carrot: { th: "แครอท", groups: ["carrot", "vegetable"] },
  pomelo: { th: "ส้มโอ", groups: ["pomelo", "citrus"] },
  orange: { th: "ส้ม", groups: ["orange", "citrus"] },
  watermelon: { th: "แตงโม", groups: ["watermelon"] },
  jackfruit: { th: "ขนุน", groups: ["jackfruit"] },
  longan: { th: "ลำไย", groups: ["longan"] },
  roselle: { th: "กระเจี๊ยบ", groups: ["roselle"] },

  // Drinks
  tea: { th: "ชา", groups: ["tea", "caffeine"] },
  "green tea": { th: "ชาเขียว", groups: ["tea", "caffeine"] },
  coffee: { th: "กาแฟ", groups: ["coffee", "caffeine"] },
  "soft drink": { th: "น้ำอัดลม", groups: ["sugar", "caffeine"] },
} satisfies Record<string, IngredientInfo>;

export type IngredientKey = keyof typeof INGREDIENTS;
