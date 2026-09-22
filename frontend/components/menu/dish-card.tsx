"use client";

import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchChip } from "@/components/ui/chip";
import { IconTile } from "@/components/ui/icon-tile";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { Dish } from "@/lib/types";
import { DISH_ICONS, REASON_STYLES, ReasonIcon, STATUS_STYLES, StatusBadge } from "./status";

interface DishCardProps {
  dish: Dish;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
}

export function DishCard({ dish, selected, onToggle, onOpen }: DishCardProps) {
  const style = STATUS_STYLES[dish.status];

  return (
    <article
      onClick={onOpen}
      className={cn(
        "flex cursor-pointer flex-col rounded-2xl border p-4 transition-all hover:shadow-md active:scale-[0.99]",
        selected ? cn(style.cardSelected, "border-brand shadow-[0_0_0_2px_#FF654230]") : cn(style.card, style.border, "shadow-[0_1px_3px_rgba(0,0,0,0.04)]"),
      )}
      aria-label={`${dish.nameEn}, ${style.label}, ${formatPrice(dish.price)}${selected ? ", selected" : ""}`}
    >
      <div className="flex flex-1 items-start gap-3">
        <IconTile
          icon={DISH_ICONS[dish.icon]}
          size="lg"
          style={{ background: dish.iconBg, color: dish.iconColor }}
        />
        <div className="min-w-0 flex-1">
          <StatusBadge status={dish.status} className="mb-1.5" />
          <h3 className="text-base leading-tight font-black text-ink">{dish.nameEn}</h3>
          <p lang="th" className="font-thai text-sm font-medium text-subtle">
            {dish.nameThai}
          </p>
          <p className="mt-0.5 text-sm font-black text-brand">{formatPrice(dish.price)}</p>

          {dish.favMatches.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {dish.favMatches.map((f) => (
                <MatchChip key={f} label={f} />
              ))}
            </div>
          )}

          {dish.conflicts.length > 0 && (
            <div className="mt-2 flex flex-col gap-0.5">
              {dish.conflicts.map((c) => (
                <p
                  key={c.name}
                  className={cn("flex items-center gap-1 text-xs font-bold", REASON_STYLES[c.reason ?? "dislike"].text)}
                >
                  <ReasonIcon reason={c.reason} size={11} />
                  {c.name} in your Avoid list
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
        <Button variant="outline" size="sm" className="flex-1" onClick={onOpen}>
          View Details
        </Button>
        <Button
          variant={selected ? "success" : "primary"}
          size="sm"
          className="flex-1 shadow-none"
          onClick={onToggle}
          aria-pressed={selected}
          aria-label={selected ? `Remove ${dish.nameEn} from order` : `Select ${dish.nameEn}`}
        >
          {selected ? (
            <>
              <Check size={14} strokeWidth={3} aria-hidden />
              Selected
            </>
          ) : (
            <>
              <Plus size={14} strokeWidth={2.5} aria-hidden />
              Select
            </>
          )}
        </Button>
      </div>
    </article>
  );
}
