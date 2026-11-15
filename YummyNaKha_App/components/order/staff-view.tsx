"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { SpeakButton } from "@/components/ui/speak-button";
import type { OrderItem } from "@/lib/store/use-order";

interface StaffViewProps {
  items: OrderItem[];
  total: number;
  onClose: () => void;
}

/**
 * Full-screen order for the diner to turn towards staff: very large Thai text,
 * and the screen kept awake (Screen Wake Lock) so it doesn't dim mid-order.
 */
export function StaffView({ items, total, onClose }: StaffViewProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    let active = true;
    const keepAwake = async () => {
      try {
        if (active && document.visibilityState === "visible" && "wakeLock" in navigator) {
          lock = await navigator.wakeLock.request("screen");
        }
      } catch {
        // Not allowed (low battery, old browser): the screen may dim as usual.
      }
    };
    // The lock is dropped when the tab is hidden; take it again on return.
    const onVisible = () => void keepAwake();
    keepAwake();
    document.addEventListener("visibilitychange", onVisible);

    // Full screen where the browser allows it (Android); iPhone keeps the page as is.
    const root = document.documentElement;
    if (root.requestFullscreen && !document.fullscreenElement) root.requestFullscreen().catch(() => {});

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKey);

    return () => {
      active = false;
      lock?.release().catch(() => {});
      document.removeEventListener("visibilitychange", onVisible);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Order for staff"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] outline-none"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <p lang="th" className="font-thai text-2xl font-bold text-subtle">
          รายการที่ต้องการสั่ง
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sand text-ink"
        >
          <X size={22} aria-hidden />
        </button>
      </div>

      <ul lang="th" className="flex flex-col divide-y-2 divide-line">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3 py-5">
            <div className="min-w-0 flex-1">
              <p className="font-thai text-[2.6rem] leading-[1.2] font-bold text-ink md:text-[3.25rem]">
                {item.nameThai}
                {item.quantity > 1 && <span className="ml-3 whitespace-nowrap text-brand">× {item.quantity}</span>}
              </p>
              {item.requests.length > 0 && (
                <p className="mt-2 font-thai text-[1.75rem] leading-snug font-bold text-brand">
                  {item.requests.map((r) => r.thai).join(" · ")}
                </p>
              )}
              {item.price !== null && (
                <p className="mt-1 font-thai text-2xl font-bold text-subtle">
                  {item.quantity > 1 ? `${item.price} × ${item.quantity} = ${item.price * item.quantity}` : item.price} บาท
                </p>
              )}
            </div>
            <SpeakButton
              text={`${item.nameThai}${item.quantity > 1 ? ` ${item.quantity} ที่` : ""} ${item.requests.map((r) => r.thai).join(" ")}`}
              label={`Read ${item.nameEn} aloud in Thai`}
              size="lg"
            />
          </li>
        ))}
      </ul>

      <p lang="th" className="mt-4 rounded-2xl bg-brand-tint p-5 text-right font-thai text-[2.25rem] font-black text-brand">
        รวม {total} บาท
      </p>
    </div>,
    document.body,
  );
}
