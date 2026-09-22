import type { AvoidItem, AvoidReason } from "./types";

export function formatPrice(price: number | null) {
  return price === null ? "Price not listed" : `฿${price.toLocaleString("en-US")}`;
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

/** "22 Sep 2026" */
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** "22 Sep 2026, 14:05" */
export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
