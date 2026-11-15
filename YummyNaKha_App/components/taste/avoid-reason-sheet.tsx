"use client";

import { useState } from "react";
import { AlertTriangle, Ban, Loader2, ShieldCheck, Stethoscope, type LucideIcon } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/feedback";
import { IconTile } from "@/components/ui/icon-tile";
import { REASON_STYLES } from "@/components/menu/status";
import { CONSENT_DOCUMENTS, HEALTH_CONSENT, HEALTH_REASONS } from "@/lib/consent";
import type { AvoidReason } from "@/lib/types";

const OPTIONS: { reason: AvoidReason; label: string; icon: LucideIcon }[] = [
  { reason: "dislike", label: "Just don't like it", icon: Ban },
  { reason: "allergy", label: "Allergy", icon: AlertTriangle },
  { reason: "doctor", label: "Doctor advised", icon: Stethoscope },
];

const isHealthReason = (reason: AvoidReason) => (HEALTH_REASONS as readonly string[]).includes(reason);

interface AvoidReasonSheetProps {
  /** The food being added; the sheet is open while this is set. */
  item: string | null;
  /** Whether the separate health-data opt-in (PDPA) is already given. */
  healthConsent: boolean;
  /** Records the health-data opt-in; rejects with a user-facing message on failure. */
  onGiveHealthConsent: () => Promise<void>;
  onChoose: (reason?: AvoidReason) => void;
  onClose: () => void;
}

export function AvoidReasonSheet({ item, healthConsent, onGiveHealthConsent, onChoose, onClose }: AvoidReasonSheetProps) {
  // An allergy / doctor reason waiting for the health-data opt-in.
  const [asking, setAsking] = useState<AvoidReason | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setAsking(null);
    setSaving(false);
    setError("");
  }

  function choose(reason?: AvoidReason) {
    if (reason && isHealthReason(reason) && !healthConsent) {
      setAsking(reason);
      return;
    }
    reset();
    onChoose(reason);
  }

  async function allowAndSave() {
    if (!asking) return;
    setSaving(true);
    try {
      await onGiveHealthConsent();
      const reason = asking;
      reset();
      onChoose(reason);
    } catch (e) {
      setSaving(false);
      setError(e instanceof Error ? e.message : "Couldn't save your choice. Please try again.");
    }
  }

  const doc = CONSENT_DOCUMENTS[HEALTH_CONSENT];

  return (
    <BottomSheet
      open={item !== null}
      onClose={() => {
        reset();
        onClose();
      }}
      label={asking ? doc.title : `Why do you avoid ${item ?? ""}?`}
    >
      {asking ? (
        <>
          <IconTile icon={ShieldCheck} className="mb-3 bg-top-50 text-success" />
          <h2 className="mb-1 text-lg font-black text-ink">Allow us to store health information?</h2>
          <p className="mb-4 text-sm text-muted">
            You marked <span className="font-bold text-ink">{item}</span> as{" "}
            {asking === "allergy" ? "an allergy" : "doctor-advised"}. This is a separate, optional consent.
          </p>
          <ul className="mb-4 flex flex-col gap-2.5">
            {doc.summary.map((line) => (
              <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-body">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
          <FieldError>{error}</FieldError>
          <div className="mt-2 flex flex-col gap-2">
            <Button fullWidth size="md" className="shadow-none" onClick={allowAndSave} disabled={saving}>
              {saving && <Loader2 size={16} className="animate-spin" aria-hidden />}
              Allow and save
            </Button>
            <Button fullWidth size="md" variant="outline" onClick={() => choose(undefined)} disabled={saving}>
              Save without a reason
            </Button>
          </div>
        </>
      ) : (
        <>
          <h2 className="mb-1 text-lg font-black text-ink">
            Why do you avoid <span className="text-brand">{item}</span>?
          </h2>
          <p className="mb-5 text-sm text-muted">Optional — helps us give you better warnings.</p>
          <div className="flex flex-col gap-3">
            {OPTIONS.map(({ reason, label, icon }) => (
              <button
                key={reason}
                type="button"
                onClick={() => choose(reason)}
                className="flex min-h-14 items-center gap-3 rounded-2xl border border-line px-5 py-4 text-left font-bold text-ink transition-colors hover:border-brand"
              >
                <IconTile icon={icon} className={REASON_STYLES[reason].tile} />
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => choose(undefined)}
              className="min-h-11 py-3 text-sm font-semibold text-subtle underline hover:text-muted"
            >
              Skip
            </button>
          </div>
        </>
      )}
    </BottomSheet>
  );
}
