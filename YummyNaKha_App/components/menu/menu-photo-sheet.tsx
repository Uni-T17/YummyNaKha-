"use client";

import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { PhotoSpot } from "@/lib/types";

interface MenuPhotoSheetProps {
  open: boolean;
  onClose: () => void;
  /**
   * Object URLs of the scanned photos, in page order, picked in this browser session
   * (the server deletes its copy after reading it); undefined for a photo no longer here.
   */
  photos: (string | undefined)[];
  /** A dish to mark on the photo ("Show on menu photo"). */
  highlight?: PhotoSpot | null;
}

/** Extra space around the marked name, as a share of the photo, so the price beside it shows too. */
const PAD = 0.012;

/**
 * The menu photo(s) the results were read from, so the diner can compare the
 * list with the paper menu and spot anything the scan missed. With
 * `highlight`, the dish is marked and scrolled into view.
 */
export function MenuPhotoSheet({ open, onClose, photos, highlight }: MenuPhotoSheetProps) {
  // Zoomed in by default when showing one dish, so the mark is easy to see.
  const [zoomChoice, setZoomChoice] = useState<boolean | null>(null);
  const zoomed = zoomChoice ?? !!highlight;
  const markRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !highlight) return;
    // Wait for the photo to lay out before scrolling to the mark.
    const t = setTimeout(() => markRef.current?.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" }), 250);
    return () => clearTimeout(t);
  }, [open, highlight, zoomed]);

  const close = () => {
    setZoomChoice(null);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={close} label="Your menu photo" className="md:max-w-2xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-ink">{highlight ? "This dish on your menu" : "Your menu photo"}</h2>
          <p className="text-xs text-muted">
            {highlight
              ? "The dish is outlined in green. Point at it to order."
              : "Compare it with the list. Something missing? Take a closer photo of that part."}
          </p>
        </div>
        {photos.some(Boolean) && (
          <Button variant="outline" size="sm" onClick={() => setZoomChoice(!zoomed)} aria-pressed={zoomed} className="shrink-0">
            {zoomed ? <ZoomOut size={14} aria-hidden /> : <ZoomIn size={14} aria-hidden />}
            {zoomed ? "Fit" : "Zoom"}
          </Button>
        )}
      </div>

      {photos.some(Boolean) && (
        <div className="flex flex-col gap-3">
          {photos.map((src, i) => {
            if (!src) return null;
            const mark = highlight?.page === i ? highlight : null;
            return (
              <div key={src} className={cn("overflow-auto rounded-2xl border border-line bg-sand", zoomed && "max-h-[65dvh]")}>
                <div className={cn("relative", zoomed ? "w-[220%]" : "w-full")}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- a local object URL; nothing to optimise */}
                  <img src={src} alt={photos.length > 1 ? `Menu photo ${i + 1}` : "Menu photo"} className="block h-auto w-full" />
                  {mark && (
                    <div
                      ref={markRef}
                      aria-hidden
                      className="pointer-events-none absolute animate-pulse rounded-md border-[3px] border-brand bg-brand/15 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]"
                      style={{
                        left: `${(mark.x - PAD) * 100}%`,
                        top: `${(mark.y - PAD) * 100}%`,
                        width: `${(mark.w + PAD * 2) * 100}%`,
                        height: `${(mark.h + PAD * 2) * 100}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </BottomSheet>
  );
}
