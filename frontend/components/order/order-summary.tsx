"use client";

import { ArrowLeft, Languages, ShoppingCart, Trash2 } from "lucide-react";
import { DISH_ICONS } from "@/components/menu/status";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { IconTile } from "@/components/ui/icon-tile";
import { PageHeader } from "@/components/ui/page-header";
import { formatPrice, pluralizeDishes } from "@/lib/format";
import { appActions } from "@/lib/store/app-store";
import { useOrder } from "@/lib/store/use-order";

export function OrderSummary() {
  const { items, total } = useOrder();

  return (
    <main className="flex flex-1 flex-col pb-28">
      <PageHeader title="My Order" subtitle="Check your picks" />

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No dishes selected yet."
          action={
            <ButtonLink href="/menu" size="md" className="shadow-none">
              Browse Menu
            </ButtonLink>
          }
        />
      ) : (
        <div className="grid gap-3 px-5 md:px-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-6">
          <ul className="flex flex-col gap-3" aria-label="Selected dishes">
            {items.map((dish) => (
              <li
                key={dish.id}
                className="flex animate-fade-up items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm"
              >
                <IconTile
                  icon={DISH_ICONS[dish.icon]}
                  size="md"
                  style={{ background: dish.iconBg, color: dish.iconColor }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-tight font-black text-ink">{dish.nameEn}</p>
                  <p lang="th" className="font-thai text-sm text-subtle">
                    {dish.nameThai}
                  </p>
                  <p className="text-sm font-black text-brand">{formatPrice(dish.price)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => appActions.toggleDish(dish.id)}
                  aria-label={`Remove ${dish.nameEn}`}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-faint transition-colors hover:text-danger"
                >
                  <Trash2 size={15} aria-hidden />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 lg:sticky lg:top-8">
            <div className="flex items-center justify-between rounded-2xl border border-line bg-white p-4">
              <span className="text-sm font-bold text-muted">{pluralizeDishes(items.length)}</span>
              <span className="text-lg font-black text-ink">Total: {formatPrice(total)}</span>
            </div>
            <ButtonLink href="/menu" variant="outline" size="md" fullWidth>
              <ArrowLeft size={16} aria-hidden />
              Add More
            </ButtonLink>
            <ButtonLink href="/order/thai" fullWidth>
              <Languages size={18} aria-hidden />
              Show in Thai
            </ButtonLink>
          </div>
        </div>
      )}
    </main>
  );
}
