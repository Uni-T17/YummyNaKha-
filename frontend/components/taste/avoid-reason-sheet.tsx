"use client";

import { AlertTriangle, Ban, Stethoscope, type LucideIcon } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { IconTile } from "@/components/ui/icon-tile";
import { REASON_STYLES } from "@/components/menu/status";
import type { AvoidReason } from "@/lib/types";

const OPTIONS: { reason: AvoidReason; label: string; icon: LucideIcon }[] = [
  { reason: "dislike", label: "Just don't like it", icon: Ban },
  { reason: "allergy", label: "Allergy", icon: AlertTriangle },
  { reason: "doctor", label: "Doctor advised", icon: Stethoscope },
];

interface AvoidReasonSheetProps {
  /** The food being added; the sheet is open while this is set. */
  item: string | null;
  onChoose: (reason?: AvoidReason) => void;
  onClose: () => void;
}

export function AvoidReasonSheet({ item, onChoose, onClose }: AvoidReasonSheetProps) {
  return (
    <BottomSheet open={item !== null} onClose={onClose} label={`Why do you avoid ${item ?? ""}?`}>
      <h2 className="mb-1 text-lg font-black text-ink">
        Why do you avoid <span className="text-brand">{item}</span>?
      </h2>
      <p className="mb-5 text-sm text-muted">Optional — helps us give you better warnings.</p>
      <div className="flex flex-col gap-3">
        {OPTIONS.map(({ reason, label, icon }) => (
          <button
            key={reason}
            type="button"
            onClick={() => onChoose(reason)}
            className="flex min-h-14 items-center gap-3 rounded-2xl border border-line px-5 py-4 text-left font-bold text-ink transition-colors hover:border-brand"
          >
            <IconTile icon={icon} className={REASON_STYLES[reason].tile} />
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChoose(undefined)}
          className="min-h-11 py-3 text-sm font-semibold text-subtle underline hover:text-muted"
        >
          Skip
        </button>
      </div>
    </BottomSheet>
  );
}
