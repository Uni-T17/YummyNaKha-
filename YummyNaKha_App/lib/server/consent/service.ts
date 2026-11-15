import "server-only";
import { AvoidReason, ConsentAction } from "@/lib/generated/prisma/client";
import {
  CONSENT_DOCUMENTS,
  hasAccepted,
  HEALTH_CONSENT,
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
  await prisma.$transaction([
    prisma.consentRecord.create({
      data: { userId, document, version: CONSENT_DOCUMENTS[document].version, action: ConsentAction.WITHDRAWN },
    }),
    // Withdrawing the health-data consent deletes the health data itself: the
    // foods stay on the Avoid list, without their allergy / doctor reason.
    ...(document === HEALTH_CONSENT
      ? [
          prisma.userPreference.updateMany({
            where: { userId, reason: { in: [AvoidReason.ALLERGY, AvoidReason.DOCTOR] } },
            data: { reason: null },
          }),
        ]
      : []),
  ]);
  return listConsentRecords(userId);
}

/** Whether the user currently allows us to store allergy / doctor-advice reasons. */
export async function hasHealthConsent(userId: string) {
  return hasAccepted(await listConsentRecords(userId), [HEALTH_CONSENT]);
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
