import type { ExtractedDish, MenuUpload, TasteProfile } from "./types";

// Sample content from the Figma prototype. Replace with API data once the
// backend (OCR + translation + ingredient inference) exists.

export const DEFAULT_PROFILE: TasteProfile = {
  favs: ["Chicken", "Cheese", "Spicy", "Noodles", "Banana"],
  avoid: [
    { name: "Peanuts", reason: "allergy" },
    { name: "Pork", reason: "doctor" },
    { name: "Mushroom", reason: "dislike" },
  ],
};

export const FAV_SUGGESTIONS = [
  "Spicy",
  "Sweet",
  "Sour",
  "Beef",
  "Seafood",
  "Tofu",
  "Rice",
  "Veggie",
  "Mild",
];

export const SAMPLE_UPLOADS: MenuUpload[] = [
  { id: "sample-1", fileName: "menu-page-1.jpg" },
  { id: "sample-2", fileName: "menu-page-2.jpg" },
];

/** What the (future) extraction step returns for the sample menu. */
export const SAMPLE_MENU: ExtractedDish[] = [
  {
    id: "1",
    nameThai: "กะเพราไก่",
    nameEn: "Chicken Basil Rice",
    price: 60,
    tags: ["chicken", "spicy", "rice", "basil", "chili", "garlic"],
    ingredients: [
      { key: "chicken", label: "chicken", certainty: "listed" },
      { key: "basil", label: "holy basil", certainty: "listed" },
      { key: "chili", label: "chili", certainty: "listed" },
      { key: "oyster sauce", label: "oyster sauce", certainty: "common" },
    ],
    icon: "flame",
    iconBg: "#FFF7ED",
    iconColor: "#EA580C",
  },
  {
    id: "2",
    nameThai: "ผัดไทยไก่",
    nameEn: "Chicken Pad Thai",
    price: 70,
    tags: ["chicken", "noodle", "sweet", "sour", "egg", "tofu"],
    ingredients: [
      { key: "chicken", label: "chicken", certainty: "listed" },
      { key: "noodle", label: "rice noodles", certainty: "listed" },
      { key: "egg", label: "egg", certainty: "listed" },
      {
        key: "peanut",
        label: "peanuts",
        certainty: "common",
        note: "Peanuts are commonly served with Pad Thai.",
      },
    ],
    icon: "pot",
    iconBg: "#FFFBEB",
    iconColor: "#D97706",
  },
  {
    id: "3",
    nameThai: "ข้าวผัดหมู",
    nameEn: "Pork Fried Rice",
    price: 60,
    tags: ["pork", "rice", "egg"],
    ingredients: [
      { key: "pork", label: "pork", certainty: "listed" },
      { key: "rice", label: "rice", certainty: "listed" },
      { key: "egg", label: "egg", certainty: "listed" },
    ],
    icon: "beef",
    iconBg: "#FFF1F2",
    iconColor: "#E11D48",
  },
  {
    id: "4",
    nameThai: "ก๋วยเตี๋ยวไก่",
    nameEn: "Chicken Noodle Soup",
    price: 55,
    tags: ["chicken", "noodle", "soup", "mild"],
    ingredients: [
      { key: "chicken", label: "chicken", certainty: "listed" },
      { key: "noodle", label: "rice noodles", certainty: "listed" },
    ],
    icon: "soup",
    iconBg: "#F0FDF4",
    iconColor: "#16A34A",
  },
  {
    id: "5",
    nameThai: "กะเพราหมูกรอบ",
    nameEn: "Crispy Pork Basil Rice",
    price: 65,
    tags: ["pork", "spicy", "rice", "basil", "chili"],
    ingredients: [
      { key: "pork", label: "pork", certainty: "listed" },
      { key: "basil", label: "holy basil", certainty: "listed" },
      { key: "chili", label: "chili", certainty: "listed" },
    ],
    icon: "beef",
    iconBg: "#FFF1F2",
    iconColor: "#E11D48",
  },
  {
    id: "6",
    nameThai: "ข้าวผัดกุ้ง",
    nameEn: "Shrimp Fried Rice",
    price: 75,
    tags: ["shrimp", "seafood", "rice", "spicy", "egg"],
    ingredients: [
      { key: "shrimp", label: "shrimp", certainty: "listed" },
      { key: "rice", label: "rice", certainty: "listed" },
      { key: "egg", label: "egg", certainty: "listed" },
    ],
    icon: "fish",
    iconBg: "#FDF4FF",
    iconColor: "#9333EA",
  },
  {
    id: "7",
    nameThai: "ผัดเห็ดไก่",
    nameEn: "Chicken with Mushrooms",
    price: 70,
    tags: ["chicken", "mushroom", "veggie"],
    ingredients: [
      { key: "chicken", label: "chicken", certainty: "listed" },
      { key: "mushroom", label: "mushrooms", certainty: "listed" },
      { key: "oyster sauce", label: "oyster sauce", certainty: "common" },
    ],
    icon: "leaf",
    iconBg: "#FFFBEB",
    iconColor: "#65A30D",
  },
];
