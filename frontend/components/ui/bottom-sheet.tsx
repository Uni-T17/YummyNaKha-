"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog. */
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * Mobile bottom sheet (Figma: dimmed backdrop, rounded-t-3xl, drag handle).
 * Closes on backdrop tap and Escape, locks page scroll and traps initial focus.
 */
export function BottomSheet({ open, onClose, label, children, className }: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-end bg-black/45"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "mx-auto max-h-[85dvh] w-full max-w-[430px] animate-sheet-up overflow-y-auto rounded-t-3xl bg-white px-5 pt-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] outline-none md:max-w-lg",
          className,
        )}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-line" aria-hidden />
        {children}
      </div>
    </div>,
    document.body,
  );
}
