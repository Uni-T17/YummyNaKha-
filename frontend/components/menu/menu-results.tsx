"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Info, ScanLine, SearchX } from "lucide-react";
import { FixedBottom } from "@/components/layout/fixed-bottom";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/cn";
import { pluralizeDishes } from "@/lib/format";
import { appActions, useAppState, useDishes } from "@/lib/store/app-store";
import type { MenuFilter } from "@/lib/types";
import { DishCard } from "./dish-card";
import { DishDetailSheet } from "./dish-detail-sheet";
import { FoodWarningSheet } from "./food-warning-sheet";

const FILTERS: { value: MenuFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "top", label: "Top Picks" },
  { value: "check", label: "Check First" },
  { value: "avoid", label: "Avoid" },
];

export function MenuResults() {
  const dishes = useDishes();
  const { selectedIds } = useAppState();
  const [filter, setFilter] = useState<MenuFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  if (!dishes) {
    return (
      <main className="flex flex-1 flex-col pb-28">
        <PageHeader title="Your Menu" subtitle="Picked for your taste" />
        <EmptyState
          icon={ScanLine}
          title="No menu analyzed yet."
          description="Upload a photo of a Thai menu and we'll sort it for your taste."
          action={
            <ButtonLink href="/home" size="md">
              Upload a Menu
            </ButtonLink>
          }
        />
      </main>
    );
  }

  const visible = filter === "all" ? dishes : dishes.filter((d) => d.status === filter);
  const openDish = dishes.find((d) => d.id === openId) ?? null;
  const hasSelection = selectedIds.length > 0;

  return (
    <main className={cn("flex flex-1 flex-col", hasSelection ? "pb-40" : "pb-24")}>
      <PageHeader
        title="Your Menu"
        subtitle="Picked for your taste"
        className="items-center pb-2"
        action={
          <button
            type="button"
            onClick={() => setShowInfo(true)}
            aria-label="About food warnings"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-muted transition-colors hover:border-brand hover:text-brand"
          >
            <Info size={16} aria-hidden />
          </button>
        }
      />

      <div role="group" aria-label="Filter dishes" className="scrollbar-hide flex gap-2 overflow-x-auto px-5 py-3 md:px-8">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={active}
              className={cn(
                "min-h-10 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-all active:scale-95",
                active ? "bg-brand text-white" : "border border-line bg-white text-muted hover:text-ink",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No dishes in this group."
          description="Try another filter to see the rest of the menu."
          className="py-12"
        />
      ) : (
        <div className="grid gap-3 px-5 md:grid-cols-2 md:gap-4 md:px-8 lg:grid-cols-3">
          {visible.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              selected={selectedIds.includes(dish.id)}
              onToggle={() => appActions.toggleDish(dish.id)}
              onOpen={() => setOpenId(dish.id)}
            />
          ))}
        </div>
      )}

      {hasSelection && (
        <FixedBottom aboveNav className="pb-2">
          <Link
            href="/order"
            className="flex min-h-14 w-full animate-fade-up items-center justify-between rounded-2xl bg-ink px-5 py-4 font-black text-white shadow-xl transition-transform active:scale-[0.98] lg:mx-auto lg:max-w-md"
          >
            <span className="text-sm font-bold">{pluralizeDishes(selectedIds.length)} selected</span>
            <span className="flex items-center gap-1.5">
              View My Order
              <ChevronRight size={18} strokeWidth={2.5} aria-hidden />
            </span>
          </Link>
        </FixedBottom>
      )}

      <DishDetailSheet
        dish={openDish}
        selected={openDish ? selectedIds.includes(openDish.id) : false}
        onToggle={() => openDish && appActions.toggleDish(openDish.id)}
        onClose={() => setOpenId(null)}
      />
      <FoodWarningSheet open={showInfo} onClose={() => setShowInfo(false)} />
    </main>
  );
}
