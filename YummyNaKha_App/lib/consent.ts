// Documents a user must accept before a menu is processed (FE2 / F15, LR2, LR9).
// The summaries are prototype drafts derived from rule.md — replace them with
// the final legal text, and bump `version` whenever a document changes so users
// are asked to accept the new version.

import { OCR_PROVIDER } from "./ai-provider";

export type ConsentDocumentId = "terms" | "privacy" | "ai-disclaimer" | "ai-transfer";

export interface ConsentDocument {
  id: ConsentDocumentId;
  title: string;
  version: string;
  /** Whether the user can withdraw this on its own (the Terms end only with the account). */
  withdrawable: boolean;
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
    version: "0.1-draft",
    withdrawable: false,
    summary: [
      "YummyNaKha! reads Thai menu photos you upload, translates them into English and suggests dishes that fit your saved taste.",
      "Suggestions help you decide — the final choice of what to order is yours.",
      "Upload only menu photos. Avoid photos that show other people or their personal details.",
    ],
  },
  privacy: {
    id: "privacy",
    title: "Privacy Notice",
    version: "0.1-draft",
    withdrawable: false,
    summary: [
      "We keep your account name and email, your food profile and, for the length of a scan, your menu photos.",
      "This data is used only to understand menus and recommend dishes — never for advertising, resale or profiling.",
      "Allergies and doctor-advised restrictions are sensitive health data. You can edit or delete them at any time.",
      "Deleting your account removes your profile, menu photos and results.",
      "Where Thai law requires it, access logs (account ID, IP address, time) are kept separately for at least 90 days.",
    ],
  },
  "ai-disclaimer": {
    id: "ai-disclaimer",
    title: "AI & Accuracy Disclaimer",
    version: "0.1-draft",
    withdrawable: false,
    summary: [
      "Results come from AI reading the menu photo and can be wrong or incomplete.",
      "A menu rarely shows hidden ingredients, sauces, cooking oil or kitchen cross-contact.",
      "A Top Pick means no conflicting ingredient was detected from the available menu information — not that a dish is safe.",
      "Always confirm allergies and medical restrictions with restaurant staff before ordering.",
    ],
  },
  "ai-transfer": {
    id: "ai-transfer",
    title: "Send data to AI providers",
    // The text names the providers actually in use (OCR_PROVIDER), and each
    // provider setup has its own version so switching asks users again.
    version: OCR_PROVIDER === "gemini" ? "0.2-draft-gemini" : "0.2-draft",
    withdrawable: true,
    summary: [
      ...(OCR_PROVIDER === "gemini"
        ? [
            "To read, translate and sort your menu, we send your menu photos and the Favs and Avoid items needed for matching to the Google Gemini API, an external AI provider.",
          ]
        : [
            "To read your menu, we send your menu photos to Hugging Face, an external AI provider, which reads and translates the text.",
            "To sort the dishes, we send the menu text and the Favs and Avoid items needed for matching to the Google Gemini API, another external AI provider.",
          ]),
      "We never send your name, email address or account details.",
      "The requests are made from our server, not from your device.",
      "You can withdraw this consent any time in My Profile → Privacy & consents. Menus can't be analyzed without it.",
    ],
  },
};

/** Accepted together as one action (F15) — kept as separate records (LR9). */
export const TERMS_BUNDLE: ConsentDocumentId[] = ["terms", "privacy", "ai-disclaimer"];

export const REQUIRED_DOCUMENTS: ConsentDocumentId[] = [...TERMS_BUNDLE, "ai-transfer"];

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
