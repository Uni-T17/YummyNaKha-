// Documents a user must accept before a menu is processed (FE2 / F15, LR9).
// The summaries are prototype drafts derived from rule.md — replace them with
// the final legal text, and bump `version` whenever a document changes so users
// are asked to accept the new version.

export type ConsentDocumentId = "terms" | "privacy" | "ai-disclaimer" | "ai-transfer";

export interface ConsentDocument {
  id: ConsentDocumentId;
  title: string;
  version: string;
  /** Whether the user can withdraw this on its own (the Terms end only with the account). */
  withdrawable: boolean;
  /** No longer asked for; kept so earlier records in a user's history still display (LR9). */
  retired?: boolean;
  summary: string[];
}

export interface ConsentRecord {
  id: string;
  userId: string;
  document: ConsentDocumentId;
  version: string;
  action: "accepted" | "withdrawn";
  /** ISO 8601 timestamp. */
  timestamp: string;
}

export const CONSENT_DOCUMENTS: Record<ConsentDocumentId, ConsentDocument> = {
  terms: {
    id: "terms",
    title: "Terms of Use",
    version: "0.3-draft",
    withdrawable: false,
    summary: [
      "YummyNaKha! reads Thai restaurant menu photos you upload, looks up each dish in our Thai dish guide and suggests dishes that fit your saved taste.",
      "Suggestions help you decide — the final choice of what to order is yours.",
      "Upload only menu photos. Avoid photos that show other people or their personal details.",
    ],
  },
  privacy: {
    id: "privacy",
    title: "Privacy Notice",
    version: "0.3-draft",
    withdrawable: false,
    summary: [
      "We keep your account name and email, your food profile and, for the length of a scan, your menu photos.",
      "Your menu photos are read on our own server. We don't send your photos, food profile or account details to any outside AI provider.",
      "This data is used only to understand menus and recommend dishes — never for advertising, resale or profiling.",
      "Allergies and doctor-advised restrictions are sensitive health data. You can edit or delete them at any time.",
      "Deleting your account removes your profile, menu photos and results.",
      "Where Thai law requires it, access logs (account ID, IP address, time) are kept separately for at least 90 days.",
    ],
  },
  "ai-disclaimer": {
    id: "ai-disclaimer",
    title: "AI & Accuracy Disclaimer",
    version: "0.3-draft",
    withdrawable: false,
    summary: [
      "Menu text is read from your photo by a machine-learning model and can be misread.",
      "Ingredients come from our Thai dish guide, which describes the usual recipe. Each restaurant cooks its own way.",
      "A menu rarely shows hidden ingredients, sauces, cooking oil or kitchen cross-contact.",
      "A Top Pick means no conflicting ingredient was detected from the available menu information — not that a dish is safe.",
      "Always confirm allergies and medical restrictions with restaurant staff before ordering.",
    ],
  },
  "ai-transfer": {
    id: "ai-transfer",
    title: "Send data to AI providers (no longer used)",
    version: "0.2-draft",
    withdrawable: false,
    retired: true,
    summary: [
      "Earlier versions of YummyNaKha! sent menu photos and the Favs and Avoid items needed for matching to external AI providers (Hugging Face and the Google Gemini API).",
      "Since version 0.3 menus are read on our own server and nothing is sent to an outside AI provider, so this consent is no longer needed.",
    ],
  },
};

/** Accepted together as one action (F15) — kept as separate records (LR9). */
export const TERMS_BUNDLE: ConsentDocumentId[] = ["terms", "privacy", "ai-disclaimer"];

export const REQUIRED_DOCUMENTS: ConsentDocumentId[] = TERMS_BUNDLE;

export type ConsentStatus = "accepted" | "withdrawn" | "outdated" | "none";

/** Current state of one document, from the user's latest record for it. */
export function getConsentStatus(records: ConsentRecord[], id: ConsentDocumentId) {
  const latest = records
    .filter((r) => r.document === id)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
  let status: ConsentStatus = "none";
  if (latest?.action === "withdrawn") status = "withdrawn";
  else if (latest) status = latest.version === CONSENT_DOCUMENTS[id].version ? "accepted" : "outdated";
  return { status, record: latest };
}

export function hasAccepted(records: ConsentRecord[], ids: ConsentDocumentId[]) {
  return ids.every((id) => getConsentStatus(records, id).status === "accepted");
}
