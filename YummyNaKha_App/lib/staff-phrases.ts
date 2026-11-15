import type { TasteProfile } from "./types";

// Ready-made sentences in Thai for the Order in Thai page, built from the
// diner's profile. The app can't see the kitchen, so it tells diners to check
// with staff (rule.md); these cards let them actually ask without speaking Thai.
//
// DRAFT TEXT — to be reviewed by a Thai-literate team member before user testing.

export interface StaffPhrase {
  id: string;
  thai: string;
  english: string;
  /** Set when we have no Thai word for an Avoid item and the English word is shown instead. */
  missingThai?: string;
}

/** By spice level 0–2; "very spicy" needs no request. */
const SPICE_PHRASES: Pick<StaffPhrase, "thai" | "english">[] = [
  { thai: "ไม่เผ็ด", english: "Not spicy, please." },
  { thai: "เผ็ดน้อย", english: "Only a little spicy, please." },
  { thai: "เผ็ดกลาง", english: "Medium spicy, please." },
];

export function staffPhrases(profile: TasteProfile): StaffPhrase[] {
  const phrases: StaffPhrase[] = [];
  // Thai has no spaces between words, but an English fallback needs them to stay readable.
  const word = (name: string, nameThai?: string) => nameThai ?? ` ${name} `;

  for (const item of profile.avoid) {
    const th = word(item.name, item.nameThai);
    const missingThai = item.nameThai ? undefined : item.name;
    if (item.reason === "allergy") {
      phrases.push({
        id: `allergy-${item.name}`,
        thai: `ฉันแพ้${th} อาหารที่สั่งมี${th}ไหม ช่วยไม่ใส่ได้ไหม`,
        english: `I'm allergic to ${item.name.toLowerCase()}. Does my order contain it? Can you leave it out?`,
        missingThai,
      });
    } else if (item.reason === "doctor") {
      phrases.push({
        id: `doctor-${item.name}`,
        thai: `หมอให้ฉันงด${th} อาหารที่สั่งมี${th}ไหม ช่วยไม่ใส่ได้ไหม`,
        english: `My doctor told me to avoid ${item.name.toLowerCase()}. Does my order contain it? Can you leave it out?`,
        missingThai,
      });
    }
  }

  if (profile.avoid.some((a) => a.reason === "allergy")) {
    phrases.push({
      id: "cross-contact",
      thai: "ฉันแพ้อาหาร ช่วยใช้กระทะและอุปกรณ์ที่ล้างสะอาดแล้วได้ไหม",
      english: "I have a food allergy. Could you use a clean wok and utensils?",
    });
  }

  const dislikes = profile.avoid.filter((a) => !a.reason || a.reason === "dislike");
  if (dislikes.length > 0) {
    phrases.push({
      id: "dislikes",
      thai: dislikes.map((a) => `ไม่ใส่${word(a.name, a.nameThai)}`).join(" "),
      english: `No ${dislikes.map((a) => a.name.toLowerCase()).join(", no ")}, please.`,
      missingThai: dislikes.filter((a) => !a.nameThai).map((a) => a.name).join(", ") || undefined,
    });
  }

  // Spice: the diner's own level, or the two most asked-for when it isn't set.
  const spice = profile.spice;
  const spiceOptions = spice === undefined ? [SPICE_PHRASES[0], SPICE_PHRASES[1]] : spice < 3 ? [SPICE_PHRASES[spice]] : [];
  spiceOptions.forEach((p, i) => phrases.push({ id: `spice-${i}`, ...p }));

  return phrases.map((p) => ({ ...p, thai: p.thai.replace(/\s+/g, " ").trim() }));
}

/** A request the diner can add to one dish on the order ("ไม่เผ็ด" — not spicy). */
export interface DishRequest {
  id: string;
  thai: string;
  english: string;
}

/** Common requests every diner may want. DRAFT TEXT — Thai to be reviewed. */
const COMMON_REQUESTS: DishRequest[] = [
  { id: "spice-0", thai: "ไม่เผ็ด", english: "Not spicy" },
  { id: "spice-1", thai: "เผ็ดน้อย", english: "A little spicy" },
  { id: "spice-3", thai: "เผ็ดมาก", english: "Extra spicy" },
  { id: "no-msg", thai: "ไม่ใส่ผงชูรส", english: "No MSG" },
  { id: "add-egg", thai: "เพิ่มไข่ดาว", english: "Add a fried egg" },
  { id: "takeaway", thai: "ใส่กล่องกลับบ้าน", english: "Take away" },
];

/**
 * Requests offered under each dish on My Order: leave out each Avoid-list
 * item we have a Thai word for, then the common ones. Picked from a list, not
 * typed, so staff always get correct Thai and no text needs translating.
 * A request is not a guarantee: the dish's 🟡/🔴 advice to ask staff still applies.
 */
export function dishRequestOptions(profile: TasteProfile): DishRequest[] {
  const avoid = profile.avoid
    .filter((a) => a.nameThai)
    .map((a) => ({
      id: `no-${a.name.toLowerCase()}`,
      thai: a.reason === "allergy" ? `ไม่ใส่${a.nameThai} (แพ้)` : `ไม่ใส่${a.nameThai}`,
      english: a.reason === "allergy" ? `No ${a.name.toLowerCase()} (allergy)` : `No ${a.name.toLowerCase()}`,
    }));
  // The diner's own spice level first among the spice options.
  const ownSpice = profile.spice !== undefined ? `spice-${profile.spice}` : null;
  const common = [...COMMON_REQUESTS].sort((a, b) => Number(b.id === ownSpice) - Number(a.id === ownSpice));
  return [...avoid, ...common];
}
