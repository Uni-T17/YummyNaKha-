import "server-only";
import { DISHES, type GuideDish } from "./dishes";
import type { DishMatch } from "./match";
import { VARIANTS } from "./variants";
import { WORDS, type MenuWord } from "./words";

// English menu lines ("Basil Pork with Fried Egg", "Tom Yum Goong", "Crab Fried
// Rice") matched to the same guide dishes and menu words as Thai lines, so an
// English menu gets the same ingredients and the same allergy check. English
// words point at the Thai menu words in words.ts / variants.ts — the ingredient
// data lives in one place only.
//
// DRAFT DATA — to be reviewed by the team before user testing.

/**
 * How restaurants write guide dishes in English or in Latin letters, beyond the
 * guide's own `en` and `romanized` names. No meat or seafood in these names —
 * the protein is read separately so it is never lost ("Basil" + "Pork").
 */
const DISH_NAMES: Record<string, string[]> = {
  "pad-kra-pao": ["holy basil", "basil", "stir fried basil", "kra pao", "krapow", "kaprao", "gaprao", "pad krapow", "pad kaprao", "pad gaprao", "pad ka prao"],
  "pad-prik-gaeng": ["red curry paste stir fry", "stir fried red curry paste"],
  "pad-prik-pao": ["chili paste stir fry", "roasted chili paste", "chili jam", "nam prik pao"],
  "garlic-pepper": ["garlic and pepper", "garlic pepper", "garlic black pepper"],
  "sweet-sour": ["sweet and sour", "sweet sour"],
  "cashew-stir-fry": ["cashew nut", "cashew", "cashew nut stir fry"],
  "stir-fried-morning-glory": ["morning glory", "water spinach", "pak boong", "pad pak bung"],
  "stir-fried-vegetables": ["stir fried vegetable", "stir fried mixed vegetable", "mixed vegetable stir fry"],
  "green-curry": ["kaeng khiao wan", "gaeng kiew wan", "kaeng keow wan", "gaeng khiao wan"],
  "red-curry": ["gaeng daeng", "kaeng phet", "gaeng phet", "kaeng daeng"],
  "massaman-curry": ["massaman", "matsaman", "mussaman", "massamun"],
  "panang-curry": ["panang", "penang", "phanaeng", "panaeng", "penang curry", "phanaeng curry"],
  "sour-curry": ["orange curry", "kaeng som"],
  "jungle-curry": ["country style curry", "kaeng pa"],
  "hor-mok": ["ho mok", "steamed fish curry", "fish curry custard"],
  "tom-yum": ["tom yam", "tomyum", "tom yum soup", "hot and sour soup"],
  "tom-kha": ["tom kar", "tom ka", "coconut soup", "coconut milk soup", "galangal soup"],
  "clear-soup": ["gaeng jued", "gaeng jeud", "kaeng chuet"],
  "pad-see-ew": ["pad see eiw", "pad siew", "pad si ew", "pad sew", "soy sauce noodle", "noodle with soy sauce", "flat noodle with soy sauce"],
  "rad-na": ["lad na", "rat na", "radna", "noodle with gravy", "gravy noodle"],
  "pad-kee-mao": ["drunken noodle", "kee mao", "pad khi mao"],
  "boat-noodles": ["boat noodle soup"],
  "yen-ta-fo": ["yentafo"],
  "egg-noodles": ["egg noodle soup", "bamee", "ba mee"],
  wonton: ["won ton", "wonton soup", "wanton"],
  "fried-rice": ["khao pad", "khao phat", "kao pad"],
  "chicken-rice": ["chicken rice", "khao mun gai", "khao man kai"],
  "braised-pork-leg-rice": ["braised pork leg", "pork leg rice", "stewed pork leg", "khao ka moo"],
  "red-pork-rice": ["red pork rice", "bbq pork rice", "bbq pork on rice", "red pork on rice"],
  "crispy-pork-rice": ["crispy pork rice", "crispy pork on rice"],
  "rice-soup": ["boiled rice", "rice soup"],
  jok: ["congee", "rice porridge", "porridge", "joke"],
  omelette: ["omelette", "omelet", "thai omelet", "kai jiao", "khai jiao", "kai jeaw"],
  "son-in-law-eggs": ["son in law egg"],
  "steamed-rice": ["jasmine rice", "plain rice", "white rice"],
  "sticky-rice": ["glutinous rice", "khao niao"],
  "som-tam-thai": ["som tum thai", "somtam thai"],
  "som-tam-poo": ["papaya salad with crab", "som tum poo"],
  "som-tam-pla-ra": ["som tum pla ra", "papaya salad lao style"],
  "som-tam": ["som tum", "somtam", "papaya salad"],
  larb: ["laab", "laap", "lap", "larp", "minced meat salad", "spicy minced salad"],
  "nam-tok": ["namtok", "waterfall salad"],
  "glass-noodle-salad": ["yum woon sen", "yam woon sen", "vermicelli salad", "glass noodle salad"],
  yum: ["spicy salad", "thai spicy salad", "yam"],
  "grilled-chicken": ["gai yang", "kai yang", "bbq chicken"],
  "grilled-pork-neck": ["kor moo yang", "grilled pork neck"],
  "grilled-pork-skewers": ["pork skewer", "moo ping", "grilled pork skewer"],
  satay: ["sate"],
  "fish-cakes": ["fish cake", "tod mun", "tod man", "thod man"],
  "spring-rolls": ["spring roll", "fried spring roll", "por pia", "poh pia", "po pia"],
  "steamed-fish-lime": ["steamed fish in lime sauce", "steamed fish with lime sauce"],
  "fish-chili-sauce": ["fish with chili sauce", "pla rad prik"],
  "mussel-pancake": ["mussel omelette", "hoy tod", "hoi tod", "crispy mussel"],
  "oyster-omelette": ["oyster omelet", "or suan", "orsuan"],
  "mango-sticky-rice": ["sticky rice with mango", "mango with sticky rice"],
  "tub-tim-grob": ["red ruby", "tub tim krob", "tab tim grob"],
  "thai-iced-tea": ["thai tea", "iced thai tea", "thai milk tea", "cha yen"],
  "lime-tea": ["lemon tea", "iced lemon tea", "lime tea", "iced lime tea"],
  "thai-iced-coffee": ["iced coffee", "thai coffee"],
  oliang: ["black iced coffee", "iced black coffee"],
  "coconut-water": ["fresh coconut", "young coconut", "coconut juice"],
  limeade: ["lime juice", "lemon juice", "fresh lime juice", "lemonade"],
  water: ["water", "mineral water", "bottled water"],
  "soft-drink": ["coke", "coca cola", "pepsi", "sprite", "fanta", "soda"],
  beer: ["singha", "chang", "leo"],
  "pad-khing": ["ginger stir fry", "stir fried ginger", "stir fried with ginger"],
  "pad-pong-karee": ["curry powder stir fry", "stir fried curry powder", "yellow curry powder"],
  "pad-kana": ["stir fried kale", "stir fried chinese kale"],
  "pad-prik-thai-dam": ["black pepper stir fry", "stir fried black pepper"],
  "pad-nam-man-hoy": ["oyster sauce stir fry", "in oyster sauce", "stir fried with oyster sauce"],
  "pad-woon-sen": ["fried glass noodle", "stir fried glass noodle", "pad woon sen"],
  "khao-soi": ["khao soy", "kao soi", "curry noodle soup", "northern curry noodle"],
  "choo-chee": ["chu chee", "choo chee"],
  "gaeng-hang-lay": ["hang lay", "hung lay", "hang le"],
  palo: ["five spice stew", "pa lo", "egg in five spice"],
  "kuay-jab": ["guay jub", "kway chap", "rolled noodle soup"],
  "noodle-tom-yum": ["tom yum noodle", "tom yum noodle soup"],
  "pad-mee": ["fried vermicelli", "stir fried vermicelli"],
  "mee-krob": ["crispy noodle", "mee grob"],
  "khao-na-ped": ["roast duck rice", "duck rice", "roast duck on rice"],
  "khao-mok-gai": ["biryani", "khao mok", "chicken biryani"],
  "yum-mamuang": ["mango salad", "green mango salad"],
  "tam-khao-pod": ["corn salad"],
  "isan-sausage": ["isaan sausage", "sour sausage", "sai krok"],
  "sai-ua": ["northern sausage", "chiang mai sausage", "sai oua"],
  "moo-kata": ["thai bbq", "moo krata", "mookata"],
  "salt-grilled-fish": ["salt crusted fish", "salt grilled fish", "grilled fish with salt"],
  "prawn-crackers": ["shrimp cracker", "prawn cracker"],
  "steamed-egg": ["steamed egg"],
  "kanom-jeeb": ["dumpling", "dim sum", "shumai", "siu mai"],
  salapao: ["steamed bun", "bao", "salapao"],
  "pa-tong-ko": ["chinese donut", "fried dough", "dough stick", "patongko"],
  "fried-banana": ["banana fritter", "fried banana", "kluay kaek"],
  "khanom-krok": ["coconut pancake"],
  "coconut-ice-cream": ["coconut ice cream"],
  "green-tea": ["iced green tea", "green tea", "matcha"],
  cocoa: ["iced chocolate", "chocolate", "iced cocoa"],
  "hot-coffee": ["coffee", "hot coffee"],
  "hot-tea": ["tea", "hot tea", "chinese tea", "jasmine tea"],
  "khanom-kuichai": ["chive dumpling", "chive cake"],
  "curry-puff": ["curry puff"],
  "miang-kham": ["miang kham", "betel leaf wrap"],
};

/**
 * English (and Thai-in-Latin-letters) menu words → the Thai menu word with the
 * same meaning. Longer phrases are tried first, so "oyster sauce" wins over
 * "oyster" and "minced pork" over "pork".
 */
const WORD_NAMES: [string[], string][] = [
  // Meat & seafood
  [["minced pork", "ground pork", "moo sab", "moo sub"], "หมูสับ"],
  [["pork belly"], "หมูสามชั้น"],
  [["pork rib", "spare rib", "rib"], "ซี่โครงหมู"],
  [["pork neck"], "คอหมู"],
  [["pork liver", "liver", "offal"], "ตับหมู"],
  [["crispy pork", "moo krob", "moo grob"], "หมูกรอบ"],
  [["red pork", "bbq pork", "roast pork", "moo daeng"], "หมูแดง"],
  [["pork", "moo", "mu"], "หมู"],
  [["chicken wing", "wing"], "ปีกไก่"],
  [["chicken breast"], "อกไก่"],
  [["chicken", "gai", "kai"], "ไก่"],
  [["beef", "nuea", "neua", "nua"], "เนื้อวัว"],
  [["roast duck"], "เป็ดย่าง"],
  [["duck", "ped", "phed"], "เป็ด"],
  [["river prawn"], "กุ้งแม่น้ำ"],
  [["shrimp", "prawn", "goong", "kung", "gung", "koong"], "กุ้ง"],
  [["squid", "calamari", "muek", "pla muek"], "ปลาหมึก"],
  [["mixed seafood", "seafood", "talay", "talee", "thalay"], "ทะเล"],
  [["crab meat"], "เนื้อปู"],
  [["soft shell crab"], "ปูนิ่ม"],
  [["crab", "poo", "pu"], "ปู"],
  [["sea bass", "seabass", "barramundi"], "ปลากะพง"],
  [["catfish"], "ปลาดุก"],
  [["mackerel"], "ปลาทู"],
  [["tilapia"], "ปลานิล"],
  [["snakehead"], "ปลาช่อน"],
  [["salmon"], "ปลาแซลมอน"],
  [["fish", "pla"], "ปลา"],
  [["mussel"], "หอยแมลงภู่"],
  [["oyster"], "หอยนางรม"],
  [["clam", "cockle"], "หอยลาย"],
  [["shellfish"], "หอย"],
  [["fried egg", "kai dao", "khai dao"], "ไข่ดาว"],
  [["boiled egg"], "ไข่ต้ม"],
  [["salted egg", "salty egg"], "ไข่เค็ม"],
  [["egg", "khai"], "ไข่"],
  [["tofu", "bean curd"], "เต้าหู้"],
  [["mixed vegetable", "vegetable", "veggie", "veg"], "ผักรวม"],
  [["vegetarian", "vegan"], "อาหารเจ"],
  [["chinese sausage"], "กุนเชียง"],
  [["sausage"], "ไส้กรอก"],
  [["jellyfish"], "แมงกะพรุน"],
  // How it's cooked
  [["stir fried", "stir fry", "sauteed", "pad", "phat"], "ผัด"],
  [["battered"], "ชุบแป้งทอด"],
  [["crispy", "crispy fried"], "ทอดกรอบ"],
  [["deep fried", "fried", "tod", "tord"], "ทอด"],
  [["grilled", "bbq", "barbecue", "barbecued", "yang", "ping"], "ย่าง"],
  [["roasted", "charcoal", "pao"], "เผา"],
  [["steamed", "nueng", "neung"], "นึ่ง"],
  [["braised", "stewed"], "ตุ๋น"],
  [["baked"], "อบ"],
  [["blanched", "boiled"], "ลวก"],
  [["iced", "cold"], "เย็น"],
  // What kind of dish
  [["curry", "gaeng", "kaeng"], "แกง"],
  [["soup", "tom"], "ต้ม"],
  [["chili dip", "chilli dip", "nam prik"], "น้ำพริก"],
  [["salad"], "สลัด"],
  [["smoothie", "shake", "frappe"], "ปั่น"],
  // Sauces & seasonings
  [["green peppercorn"], "พริกไทยอ่อน"],
  [["black pepper", "pepper"], "พริกไทยดำ"],
  [["salt and chili", "salt and pepper"], "พริกเกลือ"],
  [["chili paste", "chilli paste", "chili jam"], "น้ำพริกเผา"],
  [["red curry paste", "curry paste"], "พริกแกง"],
  [["garlic"], "กระเทียม"],
  [["chili", "chilli", "chilies", "chillies", "prik"], "พริก"],
  [["ginger", "khing"], "ขิง"],
  [["lemongrass", "lemon grass"], "ตะไคร้"],
  [["lime", "lemon", "manao"], "มะนาว"],
  [["fish sauce", "nam pla"], "น้ำปลา"],
  [["oyster sauce"], "น้ำมันหอย"],
  [["soy sauce", "soya sauce", "see ew", "see eiw"], "ซีอิ๊ว"],
  [["soybean paste", "bean paste", "black bean sauce", "black bean"], "เต้าเจี้ยว"],
  [["fermented fish", "pla ra", "pla raa"], "ปลาร้า"],
  [["shrimp paste", "kapi"], "กะปิ"],
  [["curry powder"], "ผงกะหรี่"],
  [["tamarind sauce", "tamarind"], "ซอสมะขาม"],
  [["three flavour sauce", "three flavor sauce", "three flavor", "three flavour"], "สามรส"],
  [["seafood sauce", "seafood dipping sauce"], "น้ำจิ้มซีฟู้ด"],
  [["sweet chili sauce", "sweet chilli sauce"], "น้ำจิ้มไก่"],
  [["coconut milk", "coconut cream", "kati"], "กะทิ"],
  [["turmeric"], "ขมิ้น"],
  [["sesame oil"], "น้ำมันงา"],
  [["sesame"], "งาขาว"],
  [["garlic butter"], "เนยกระเทียม"],
  [["butter"], "เนย"],
  [["cheese"], "ชีส"],
  [["mayonnaise", "mayo"], "มายองเนส"],
  [["thai basil", "sweet basil"], "โหระพา"],
  [["holy basil", "basil"], "ใบกะเพรา"],
  [["herb"], "สมุนไพร"],
  [["kaffir lime leaf", "lime leaf"], "ใบมะกรูด"],
  [["dipping sauce", "dip"], "น้ำจิ้ม"],
  // Vegetables, fruit, nuts, drinks
  [["mushroom"], "เห็ด"],
  [["bamboo shoot"], "หน่อไม้"],
  [["bean sprout"], "ถั่วงอก"],
  [["long bean", "green bean", "string bean"], "ถั่วฝักยาว"],
  [["winged bean"], "ถั่วพู"],
  [["peanut", "groundnut"], "ถั่วลิสง"],
  [["cashew nut", "cashew"], "เม็ดมะม่วงหิมพานต์"],
  [["stink bean", "sator", "sataw"], "สะตอ"],
  [["chinese kale", "kale", "kana"], "คะน้า"],
  [["morning glory", "water spinach"], "ผักบุ้ง"],
  [["broccoli"], "บรอกโคลี"],
  [["cauliflower"], "กะหล่ำดอก"],
  [["cabbage"], "กะหล่ำปลี"],
  [["baby corn"], "ข้าวโพดอ่อน"],
  [["corn", "sweetcorn"], "ข้าวโพด"],
  [["carrot"], "แครอท"],
  [["bell pepper", "capsicum", "sweet pepper"], "พริกหยวก"],
  [["tomato", "tomatoe"], "มะเขือเทศ"],
  [["eggplant", "aubergine"], "มะเขือยาว"],
  [["cucumber"], "แตงกวา"],
  [["bitter melon", "bitter gourd"], "มะระ"],
  [["pumpkin"], "ฟักทอง"],
  [["taro"], "เผือก"],
  [["acacia", "cha om"], "ชะอม"],
  [["chive", "garlic chive"], "กุยช่าย"],
  [["spring onion", "scallion", "green onion"], "ต้นหอม"],
  [["onion"], "หอมใหญ่"],
  [["coriander", "cilantro"], "ผักชี"],
  [["pineapple"], "สับปะรด"],
  [["mango"], "มะม่วง"],
  [["papaya"], "มะละกอ"],
  [["pomelo"], "ส้มโอ"],
  [["watermelon"], "แตงโม"],
  [["coconut"], "มะพร้าว"],
  [["banana"], "กล้วย"],
  [["longan"], "ลำไย"],
  [["roselle"], "กระเจี๊ยบ"],
  [["jackfruit"], "ขนุน"],
  [["orange"], "ส้ม"],
  [["custard"], "สังขยา"],
  [["green tea", "matcha"], "ชาเขียว"],
  [["tea", "cha"], "ชา"],
  [["coffee", "espresso", "latte", "cappuccino", "americano", "mocha"], "กาแฟ"],
  [["chocolate", "cocoa"], "โกโก้"],
  [["milk", "fresh milk", "condensed milk", "evaporated milk"], "นมสด"],
  [["soda water"], "โซดา"],
  [["beer"], "เบียร์"],
  [["whisky", "whiskey", "spirit", "rum"], "เหล้า"],
  // What it's served on
  [["sticky rice", "glutinous rice"], "ข้าวเหนียว"],
  [["rice", "khao"], "ข้าว"],
  [["egg noodle", "ba mee", "bamee"], "บะหมี่"],
  [["glass noodle", "woon sen", "bean thread"], "วุ้นเส้น"],
  [["rice vermicelli", "vermicelli", "sen mee"], "เส้นหมี่"],
  [["instant noodle", "mama"], "มาม่า"],
  [["rice noodle", "flat noodle", "wide noodle", "thin noodle", "noodle", "sen yai", "sen lek"], "เส้นก๋วยเตี๋ยว"],
  [["khanom jeen", "khanom chin", "fermented rice noodle"], "ขนมจีน"],
  [["bread", "toast"], "ขนมปัง"],
];

/** Words that don't change what's in the dish; they count as read, not as unknown. */
const FILLER = new Set([
  "with", "and", "or", "in", "on", "of", "the", "a", "an", "w", "served", "style", "thai", "special", "our", "house",
  "homemade", "fresh", "spicy", "sweet", "sour", "mild", "hot", "sauce", "topped", "over", "top", "choice", "your", "set",
  "plate", "bowl", "cup", "glass", "small", "large", "extra", "add", "signature", "famous", "traditional", "classic",
  "dish", "menu", "sod", "favorite", "favourite", "local", "authentic", "isan", "isaan", "northern", "southern", "jumbo", "big",
]);

/** Lower-case words, no punctuation, simple plurals folded ("Prawns" → "prawn", "Tomatoes" → "tomatoe"). */
export function englishTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => (w.length > 3 && w.endsWith("s") && !/(ss|us|is)$/.test(w) ? w.slice(0, -1) : w));
}

interface Phrase<T> {
  tokens: string[];
  item: T;
}

function phrases<T>(entries: [string[], T][]): Phrase<T>[] {
  return entries
    .flatMap(([names, item]) => names.map((name) => ({ tokens: englishTokens(name), item })))
    .filter((p) => p.tokens.length > 0)
    .sort((a, b) => b.tokens.length - a.tokens.length || b.tokens.join(" ").length - a.tokens.join(" ").length);
}

const ALL_WORDS: MenuWord[] = [...VARIANTS, ...WORDS];
const wordFor = (th: string): MenuWord => {
  const word = ALL_WORDS.find((w) => w.th.includes(th));
  if (!word) throw new Error(`english.ts: no menu word spelled "${th}" in words.ts / variants.ts`);
  return word;
};

const WORD_PHRASES = phrases(WORD_NAMES.map(([names, th]) => [names, wordFor(th)]));
const DISH_PHRASES = phrases<GuideDish>(
  DISHES.map((dish) => [[dish.en.replace(/\(.*?\)/g, " "), dish.romanized, ...(DISH_NAMES[dish.id] ?? [])], dish]),
);

for (const id of Object.keys(DISH_NAMES)) {
  if (!DISHES.some((d) => d.id === id)) throw new Error(`english.ts: DISH_NAMES has "${id}", which is not a guide dish`);
}

const startsAt = (tokens: string[], at: number, phrase: string[]) => phrase.every((t, k) => tokens[at + k] === t);

/** Reads known English menu words left to right, longest phrase first. */
export function readEnglishWords(tokens: string[]): { words: MenuWord[]; coverage: number } {
  const words: MenuWord[] = [];
  let known = 0;
  for (let i = 0; i < tokens.length; ) {
    const hit = WORD_PHRASES.find((p) => startsAt(tokens, i, p.tokens));
    if (hit) {
      if (!words.includes(hit.item)) words.push(hit.item);
      known += hit.tokens.length;
      i += hit.tokens.length;
    } else {
      if (FILLER.has(tokens[i])) known++;
      i++;
    }
  }
  return { words, coverage: tokens.length > 0 ? known / tokens.length : 0 };
}

/** Share of a line that must be known words before it is read word by word. */
const DECODE_MIN_COVERAGE = 0.6;

/** A menu line written in English or in Latin letters. */
export function matchEnglishLine(text: string): DishMatch {
  const tokens = englishTokens(text);
  if (tokens.length === 0) return { dish: null, words: [], quality: "none", coverage: 0 };

  // The dish is named before "with": "Basil Pork with Fried Egg" is a basil
  // stir-fry, not a fried egg. Otherwise the longest name wins, then the earliest:
  // "Pineapple Fried Rice" over "Fried Rice", "Spicy Basil Fried Rice" is fried rice.
  const withAt = tokens.findIndex((t) => t === "with" || t === "w");
  const head = withAt === -1 ? tokens.length : withAt;
  let best: { dish: GuideDish; start: number; length: number } | null = null;
  for (const { tokens: name, item } of DISH_PHRASES) {
    for (let at = 0; at + name.length <= tokens.length; at++) {
      if (!startsAt(tokens, at, name)) continue;
      const candidate = { dish: item, start: at, length: name.length };
      const rank = (c: typeof candidate) => [Number(c.start < head), c.length, -c.start];
      const [a, b] = [rank(candidate), best ? rank(best) : null];
      if (!b || a[0] > b[0] || (a[0] === b[0] && (a[1] > b[1] || (a[1] === b[1] && a[2] > b[2])))) best = candidate;
      break;
    }
  }
  if (best) {
    const rest = [...tokens.slice(0, best.start), ...tokens.slice(best.start + best.length)];
    const read = readEnglishWords(rest);
    // Any unknown word next to the dish name ("Cheese Tom Yum Fries") may mean a different dish.
    const partlyRead = rest.length - Math.round(read.coverage * rest.length) > 0;
    return { dish: best.dish, words: read.words, quality: "exact", coverage: 1, partlyRead };
  }

  const read = readEnglishWords(tokens);
  const decodable = read.words.some((w) => w.kind !== "style");
  return { dish: null, words: read.words, quality: decodable && read.coverage >= DECODE_MIN_COVERAGE ? "decoded" : "none", coverage: read.coverage };
}

/** Thai name to show restaurant staff: the guide name plus the meat or seafood the menu names (แกงเขียวหวาน + ไก่). */
export function thaiNameFor(dish: GuideDish, words: MenuWord[]): string {
  const proteins = words.filter((w) => w.kind === "protein").map((w) => w.th[0]);
  return [dish.th[0], ...proteins.filter((th) => !dish.th[0].includes(th))].join("");
}
