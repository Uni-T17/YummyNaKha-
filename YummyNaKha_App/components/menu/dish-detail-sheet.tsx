"use client";

import { AlertTriangle, Check, Heart, Info, ShoppingCart } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { cn } from "@/lib/cn";
import { formatPrice, reasonLabel } from "@/lib/format";
import type { Dish } from "@/lib/types";
import { DISH_ICONS, ReasonIcon, StatusBadge } from "./status";

interface DishDetailSheetProps {
  dish: Dish | null;
  selected: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function DishDetailSheet({ dish, selected, onToggle, onClose }: DishDetailSheetProps) {
  return (
    <BottomSheet open={dish !== null} onClose={onClose} label={dish ? `${dish.nameEn} details` : "Dish details"}>
      {dish && (
        <>
          <div className="mb-5 flex items-center gap-4">
            <IconTile
              icon={DISH_ICONS[dish.icon]}
              size="xl"
              style={{ background: dish.iconBg, color: dish.iconColor }}
            />
            <div>
              <StatusBadge status={dish.status} className="mb-1.5" />
              <h2 className="text-xl leading-tight font-black text-ink">{dish.nameEn}</h2>
              <p lang="th" className="font-thai text-base font-medium text-subtle">
                {dish.nameThai}
              </p>
              <p className="text-lg font-black text-brand">{formatPrice(dish.price)}</p>
            </div>
          </div>

          {dish.favMatches.length > 0 && (
            <section className="mb-4 rounded-2xl bg-top-50 p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-black text-top-ink">
                <Heart size={13} aria-hidden />
                Why you might like it
              </h3>
              <ul>
                {dish.favMatches.map((f) => (
                  <li key={f} className="mb-0.5 flex items-center gap-2 text-sm text-ink">
                    <Heart size={12} className="text-brand" aria-hidden />
                    <span className="font-bold">{f}</span>
                    <span className="text-subtle">— in your Favs</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {dish.conflicts.length > 0 && (
            <section
              className={cn("mb-4 rounded-2xl p-4", dish.status === "avoid" ? "bg-avoid-badge" : "bg-check-badge")}
            >
              <h3
                className={cn(
                  "mb-2 flex items-center gap-1.5 text-sm font-black",
                  dish.status === "avoid" ? "text-avoid-ink" : "text-check-ink",
                )}
              >
                <AlertTriangle size={13} aria-hidden />
                Check before ordering
              </h3>
              <ul>
                {dish.conflicts.map((c) => (
                  <li key={c.name} className="mb-3 last:mb-0">
                    <div className="mb-1 flex items-center gap-1.5">
                      <ReasonIcon reason={c.reason} />
                      <span className="text-sm font-black text-ink">{c.name}</span>
                      {c.reason && <span className="text-xs font-medium text-muted">— {reasonLabel(c.reason)}</span>}
                    </div>
                    <p className={cn("text-xs leading-relaxed text-muted", c.reason && c.reason !== "dislike" && "ml-5")}>
                      {c.note}
                    </p>
                  </li>
                ))}
              </ul>
              {/* Product safety rule (rule.md): every check / avoid result points to restaurant staff. */}
              {dish.conflicts.some((c) => !c.note.includes("restaurant staff")) && (
                <p className="mt-3 border-t border-black/5 pt-3 text-xs font-semibold text-muted">
                  Ingredients and preparation can vary — confirm with restaurant staff.
                </p>
              )}
            </section>
          )}

          {dish.status === "top" && (
            <div className="mb-4 flex gap-2 rounded-2xl border border-line p-3.5">
              <Info size={14} className="mt-0.5 shrink-0 text-muted" aria-hidden />
              <p className="text-xs leading-relaxed text-muted">
                No detected conflict from the available menu information. Always confirm serious allergies or medical
                restrictions with restaurant staff.
              </p>
            </div>
          )}

          <Button
            fullWidth
            variant={selected ? "success" : "primary"}
            className="shadow-none"
            onClick={() => {
              onToggle();
              onClose();
            }}
          >
            {selected ? (
              <>
                <Check size={18} strokeWidth={3} aria-hidden />
                In My Order
              </>
            ) : (
              <>
                <ShoppingCart size={18} aria-hidden />
                Add to My Order
              </>
            )}
          </Button>
        </>
      )}
    </BottomSheet>
  );
}
