"use client";

import { Info } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";

export function FoodWarningSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} label="About food warnings">
      <h2 className="mb-3 flex items-center gap-2 font-black text-ink">
        <Info size={16} className="text-brand" aria-hidden />
        About food warnings
      </h2>
      <p className="text-sm leading-relaxed text-muted">
        YummyNaKha! helps identify possible food conflicts from menu information, but restaurant ingredients and
        preparation can vary. Always confirm serious allergies or medical restrictions with restaurant staff.
      </p>
      <Button fullWidth size="md" className="mt-5 shadow-none" onClick={onClose}>
        Got it
      </Button>
    </BottomSheet>
  );
}
