import "server-only";
import type { OcrLine } from "../ocr/client";

// Turns OCR text boxes into menu items: a dish name plus the price printed on
// the same row. Names are Thai, or English on a menu printed in English only. Menus usually put the price in its own box to the right of the
// name, sometimes in a second column, and photos are rarely perfectly level.

export interface MenuItem {
  /** The dish name as printed: Thai, or English on an English menu. */
  name: string;
  /** null when no price is printed for the item (never guessed). */
  price: number | null;
}

type Box = OcrLine["box"];

const THAI_DIGITS = /[๐-๙]/g;
const PRICE_SUFFIX = String.raw`(?:\s*(?:บาท|บ\.|฿|\.-|-|\.00|THB|[Bb]aht|B\b))?`;
const PRICE_PREFIX = String.raw`(?:฿|THB)?`;
/** A letter a dish name can contain: Thai, or Latin on an English menu. */
const LETTER = "[ก-ฮA-Za-z]";
/** "60", or a range "200-250" / "200- 250" / "120.00 - 150.00" (sold by size); the lowest price is kept. */
const PRICE = String.raw`(\d{2,5})(?:\.00)?(?:\s*[-–]\s*\d{2,5}(?:\.00)?)?`;
/** A box that is only a price: "60", "60 บาท", "฿60", "60.-", "200- 250.-", "80 THB". */
const PRICE_ONLY = new RegExp(String.raw`^${PRICE_PREFIX}\s*${PRICE}${PRICE_SUFFIX}\s*$`);
/** A name with the price in the same box: "ผัดไทย ....... 60", "Pad Thai 80". */
const NAME_THEN_PRICE = new RegExp(String.raw`^(.*${LETTER}.*?)[\s.…_:-]*${PRICE_PREFIX}\s*${PRICE}${PRICE_SUFFIX}\s*$`);

/** A price followed by the next item's name in one box: "200- 250.-น้ำอัดลม". */
const PRICE_THEN_NAME = new RegExp(String.raw`^(${PRICE_PREFIX}\s*${PRICE}${PRICE_SUFFIX}\s*)(.*${LETTER}.*)$`);

/** Two items in one box: "ปลาทอด (ตามขนาด) 200- 250.-น้ำเปล่า". */
const NAME_PRICE_NAME = new RegExp(String.raw`^(.*${LETTER}.*?)[\s.…_:-]*${PRICE_PREFIX}\s*${PRICE}${PRICE_SUFFIX}\s*(.*${LETTER}.*)$`);

/**
 * Shop details printed on menus that aren't dishes: phone numbers ("โทร. 095-849…"),
 * opening hours, Line / Facebook / web addresses, delivery apps, Wi-Fi. A phone
 * number would otherwise be read as a dish with its digits as the price.
 */
const SHOP_INFO = new RegExp(
  [
    String.raw`โทร|เบอร์|tel\b|phone|call\b`,
    String.raw`\b0\d{1,2}[\s-]?\d{3}[\s-]?\d{3,4}\b`, // Thai phone number
    // Opening hours: words, or a time written with "น." — a bare "10.00 - 20.00" could be a price range.
    String.raw`เปิด|ปิด(?:ทุก|วัน)|open\b|close[sd]?\b|\d{1,2}[.:]\d{2}\s*น\.`,
    String.raw`line\s*(?:id|@)|ไลน์|@\w{3,}|facebook|fb\b|เฟซบุ๊ก|เพจ|instagram|ig\b|www\.|https?:|\.com\b`,
    String.raw`grab|lineman|line man|foodpanda|robinhood|shopee\s*food|wi-?fi|password|รหัส`,
  ].join("|"),
  "i",
);

/** "บาท" / "THB" printed in its own box next to a price. */
const CURRENCY_ONLY = /^(?:บาท\S?|บ\.?|฿|THB|[Bb]aht|B)$/;

const toArabic = (s: string) => s.replace(THAI_DIGITS, (d) => String(d.charCodeAt(0) - 0x0e50));
const thaiLetters = (s: string) => (s.match(/[ก-ฮ]/g) ?? []).length;
const latinLetters = (s: string) => (s.match(/[A-Za-z]/g) ?? []).length;
const isThaiName = (s: string) => thaiLetters(s) >= 2;
const isEnglishName = (s: string) => thaiLetters(s) < 2 && latinLetters(s) >= 3;

/**
 * A page is read in English only when its names are mostly English. A Thai
 * menu with English translations underneath keeps the Thai names — the guide
 * is matched on Thai — and ignores the English copies.
 */
function readsEnglish(lines: OcrLine[]) {
  const texts = lines.map((l) => toArabic(l.text).trim()).filter((t) => !PRICE_ONLY.test(t));
  const thai = texts.filter(isThaiName).length;
  const english = texts.filter(isEnglishName).length;
  return english >= 3 && thai < english * 0.25;
}
const height = (b: Box) => b[3] - b[1];

const centerX = (b: Box) => (b[0] + b[2]) / 2;
const centerY = (b: Box) => (b[1] + b[3]) / 2;

/** Vertical overlap as a share of the shorter box, after moving `b` up or down by `shift`. */
function rowOverlap(a: Box, b: Box, shift = 0) {
  const overlap = Math.min(a[3], b[3] + shift) - Math.max(a[1], b[1] + shift);
  return overlap / Math.max(1, Math.min(height(a), height(b)));
}

/**
 * How much a row drifts up or down per pixel to the right in a tilted photo,
 * estimated from name/price pairs that clearly belong together.
 */
function estimateTilt(names: Name[], prices: { box: Box }[]): number {
  const best = <T,>(options: T[], overlap: (o: T) => number) => {
    let top: T | null = null;
    let topOverlap = 0.3;
    for (const o of options) {
      const v = overlap(o);
      if (v > topOverlap) [top, topOverlap] = [o, v];
    }
    return top;
  };
  const slopes: number[] = [];
  for (const price of prices) {
    const name = best(names.filter((n) => n.box[2] <= price.box[0]), (n) => rowOverlap(n.box, price.box));
    if (!name || best(prices, (p) => rowOverlap(name.box, p.box)) !== price) continue;
    const dx = centerX(price.box) - centerX(name.box);
    if (dx > 0) slopes.push((centerY(price.box) - centerY(name.box)) / dx);
  }
  if (slopes.length < 2) return 0;
  slopes.sort((a, b) => a - b);
  return slopes[Math.floor(slopes.length / 2)];
}

interface Name {
  text: string;
  box: Box;
  price: number | null;
}

export function parseMenuLines(lines: OcrLine[]): MenuItem[] {
  const english = readsEnglish(lines);
  const names: Name[] = [];
  const prices: { value: number; box: Box }[] = [];

  for (const raw of lines) {
    let line = raw;
    let text = toArabic(raw.text).trim();
    if (SHOP_INFO.test(text)) continue; // phone, hours, social media — not a dish, and its digits aren't a price
    // Split a leading price off: it belongs to the item on the left, the rest is a new name.
    const lead = text.match(PRICE_THEN_NAME);
    if (lead) {
      const [x0, y0, x1, y1] = line.box;
      const split = Math.round(x0 + ((x1 - x0) * lead[1].length) / text.length);
      prices.push({ value: Number(lead[2]), box: [x0, y0, split, y1] });
      text = lead[3].trim();
      line = { ...raw, box: [split, y0, x1, y1] };
    }
    const priceOnly = text.match(PRICE_ONLY);
    if (priceOnly) {
      prices.push({ value: Number(priceOnly[1]), box: line.box });
      continue;
    }
    // Split off earlier items when one box holds "name price name…"; the box is divided by text length.
    for (let both = text.match(NAME_PRICE_NAME); both; both = text.match(NAME_PRICE_NAME)) {
      const [x0, y0, x1, y1] = line.box;
      const split = Math.round(x0 + ((x1 - x0) * (text.length - both[3].length)) / text.length);
      names.push({ text: both[1].trim(), box: [x0, y0, split, y1], price: Number(both[2]) });
      text = both[3].trim();
      line = { ...line, box: [split, y0, x1, y1] };
    }
    text = text.replace(/^[\s.…_:,-]+/, ""); // leaders left over from ". . . . 60" layouts
    // Stray marks, noise, a lone "บาท"; on a Thai menu, also the English copies of the names.
    if (!(isThaiName(text) || (english && isEnglishName(text))) || CURRENCY_ONLY.test(text)) continue;
    const inline = text.match(NAME_THEN_PRICE);
    names.push(
      inline
        ? { text: inline[1].trim(), box: line.box, price: Number(inline[2]) }
        : { text, box: line.box, price: null },
    );
  }

  // A name split into two boxes on the same row ("ผัดกะ" + "เพราหมู", "Crab" + "Fried Rice") is one name.
  names.sort((a, b) => a.box[1] - b.box[1] || a.box[0] - b.box[0]);
  for (let i = 0; i < names.length - 1; i++) {
    const a = names[i];
    const b = names[i + 1];
    const gap = b.box[0] - a.box[2];
    if (a.price === null && rowOverlap(a.box, b.box) >= 0.6 && gap >= 0 && gap < height(a.box) * 0.8) {
      names.splice(i, 2, {
        text: /[A-Za-z]$/.test(a.text) && /^[A-Za-z]/.test(b.text) ? `${a.text} ${b.text}` : `${a.text}${b.text}`,
        box: [a.box[0], Math.min(a.box[1], b.box[1]), b.box[2], Math.max(a.box[3], b.box[3])],
        price: b.price,
      });
      i--;
    }
  }

  // Give each price to the name on its left that shares the most of its row,
  // after correcting for the photo's tilt.
  const tilt = estimateTilt(names, prices);
  const pairs: { name: Name; price: number; overlap: number; distance: number }[] = [];
  prices.forEach((price, index) => {
    for (const name of names) {
      if (name.price !== null || name.box[2] > price.box[0] + height(price.box)) continue;
      const overlap = rowOverlap(name.box, price.box, -tilt * (centerX(price.box) - centerX(name.box)));
      if (overlap >= 0.3) pairs.push({ name, price: index, overlap, distance: price.box[0] - name.box[2] });
    }
  });
  pairs.sort((a, b) => b.overlap - a.overlap || a.distance - b.distance);
  const usedPrices = new Set<number>();
  for (const pair of pairs) {
    if (pair.name.price !== null || usedPrices.has(pair.price)) continue;
    pair.name.price = prices[pair.price].value;
    usedPrices.add(pair.price);
  }

  return names.map((n) => ({ name: n.text, price: n.price }));
}
