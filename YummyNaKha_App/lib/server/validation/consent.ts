import { z } from "zod";
import { CONSENT_DOCUMENTS, type ConsentDocumentId } from "@/lib/consent";

const documentId = z.enum(Object.keys(CONSENT_DOCUMENTS) as [ConsentDocumentId, ...ConsentDocumentId[]], {
  error: "Unknown document.",
});

export const acceptConsentSchema = z.object({
  documents: z
    .array(documentId)
    .min(1, "Choose at least one document.")
    .max(Object.keys(CONSENT_DOCUMENTS).length)
    .refine((d) => new Set(d).size === d.length, "Documents must not repeat."),
});

export const withdrawConsentSchema = z.object({ document: documentId });
