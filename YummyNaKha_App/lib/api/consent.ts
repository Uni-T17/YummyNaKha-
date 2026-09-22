import type { ConsentDocumentId, ConsentRecord } from "../consent";
import { apiFetch } from "./client";

// Consent records are stored server-side (append-only). The server stamps the
// user, document version and time — the browser only says which documents.

type RecordsResponse = { records: ConsentRecord[] };

export async function getConsentRecords(): Promise<ConsentRecord[]> {
  return (await apiFetch<RecordsResponse>("/api/consents")).records;
}

export async function acceptDocuments(documents: ConsentDocumentId[]): Promise<void> {
  if (documents.length === 0) return;
  await apiFetch<RecordsResponse>("/api/consents", { body: { documents } });
}

export async function withdrawConsent(document: ConsentDocumentId): Promise<void> {
  await apiFetch<RecordsResponse>("/api/consents/withdraw", { body: { document } });
}
