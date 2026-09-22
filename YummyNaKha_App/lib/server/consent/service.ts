import "server-only";
import { ConsentAction } from "@/lib/generated/prisma/client";
import {
  CONSENT_DOCUMENTS,
  hasAccepted,
  REQUIRED_DOCUMENTS,
  type ConsentDocumentId,
  type ConsentRecord,
} from "@/lib/consent";
import { prisma } from "../db";
import { errors, HttpError } from "../http";

// Append-only consent log (FE2 / LR2, LR9). The server stamps the user, the
// document version and the time — none of these come from the client.

export async function listConsentRecords(userId: string): Promise<ConsentRecord[]> {
  const rows = await prisma.consentRecord.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    document: r.document as ConsentDocumentId,
    version: r.version,
    action: r.action === ConsentAction.ACCEPTED ? "accepted" : "withdrawn",
    timestamp: r.createdAt.toISOString(),
  }));
}

export async function acceptDocuments(userId: string, documents: ConsentDocumentId[]) {
  await prisma.consentRecord.createMany({
    data: documents.map((document) => ({
      userId,
      document,
      version: CONSENT_DOCUMENTS[document].version,
      action: ConsentAction.ACCEPTED,
    })),
  });
  return listConsentRecords(userId);
}

export async function withdrawConsent(userId: string, document: ConsentDocumentId) {
  if (!CONSENT_DOCUMENTS[document].withdrawable) {
    throw errors.badRequest("This agreement can't be withdrawn on its own.");
  }
  await prisma.consentRecord.create({
    data: { userId, document, version: CONSENT_DOCUMENTS[document].version, action: ConsentAction.WITHDRAWN },
  });
  return listConsentRecords(userId);
}

/** Throws 403 CONSENT_REQUIRED unless every required document is accepted at its current version. */
export async function assertProcessingConsent(userId: string) {
  const records = await listConsentRecords(userId);
  if (!hasAccepted(records, REQUIRED_DOCUMENTS)) {
    throw new HttpError(
      403,
      "CONSENT_REQUIRED",
      "Please review and accept how your menu is processed before we analyze it.",
    );
  }
}
