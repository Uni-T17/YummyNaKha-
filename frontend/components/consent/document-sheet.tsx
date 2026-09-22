"use client";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { CONSENT_DOCUMENTS, type ConsentDocumentId } from "@/lib/consent";

/** Readable summary of one agreement, opened from its "Read" link. */
export function DocumentSheet({ id, onClose }: { id: ConsentDocumentId | null; onClose: () => void }) {
  const doc = id ? CONSENT_DOCUMENTS[id] : null;
  return (
    <BottomSheet open={doc !== null} onClose={onClose} label={doc?.title ?? "Document"}>
      {doc && (
        <>
          <h2 className="text-lg font-black text-ink">{doc.title}</h2>
          <p className="mb-4 text-xs font-bold tracking-wider text-subtle uppercase">Version {doc.version}</p>
          <ul className="flex flex-col gap-3">
            {doc.summary.map((line) => (
              <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-body">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-xl bg-stone-soft px-3 py-2.5 text-xs text-muted">
            Draft summary for the prototype — the full document is still being written.
          </p>
          <Button fullWidth size="md" className="mt-5 shadow-none" onClick={onClose}>
            Got it
          </Button>
        </>
      )}
    </BottomSheet>
  );
}
