import type { AvoidItem, AvoidReason } from "./types";

export function formatPrice(price: number) {
  return `฿${price.toLocaleString("en-US")}`;
}

export function pluralizeDishes(count: number) {
  return `${count} ${count === 1 ? "dish" : "dishes"}`;
}

/** "Jane Doe" → "JD", "jane" → "JA". */
export function getInitials(name: string | undefined) {
  const clean = (name ?? "").trim();
  if (!clean) return "YN";
  const words = clean.split(/\s+/);
  const letters = words.length > 1 ? words.map((w) => w[0]).join("") : clean.slice(0, 2);
  return letters.toUpperCase().slice(0, 2);
}

export function reasonLabel(reason?: AvoidReason) {
  if (reason === "allergy") return "Allergy";
  if (reason === "doctor") return "Doctor advised";
  return "Just avoid";
}

/** Compact form used in the Home taste summary: "Peanuts (Allergy) · Pork (Dr.)". */
export function summarizeAvoid(items: AvoidItem[]) {
  return items
    .map((a) => a.name + (a.reason === "allergy" ? " (Allergy)" : a.reason === "doctor" ? " (Dr.)" : ""))
    .join(" · ");
}
