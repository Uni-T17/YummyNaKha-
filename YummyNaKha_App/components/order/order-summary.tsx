"use client";

import { useState } from "react";
import { ArrowLeft, Check, ChevronDown, Languages, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { DISH_ICONS } from "@/components/menu/status";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { IconTile } from "@/components/ui/icon-tile";
import { PageHeader } from "@/components/ui/page-header";
import { SpeakButton } from "@/components/ui/speak-button";
import { cn } from "@/lib/cn";
import { formatPrice, pluralizeDishes } from "@/lib/format";
import { appActions } from "@/lib/store/app-store";
import type { DishRequest } from "@/lib/staff-phrases";
import { useOrder, type OrderItem } from "@/lib/store/use-order";

function QuantityStepper({ item }: { item: OrderItem }) {
  const button =
    "flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-brand hover:text-brand disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink";
  return (
    <div className="flex items-center gap-1" role="group" aria-label={`How many ${item.nameEn}`}>
      <button
        type="button"
        className={button}
        onClick={() => appActions.setQuantity(item.id, item.quantity - 1)}
        disabled={item.quantity <= 1}
        aria-label="One less"
      >
        <Minus size={14} aria-hidden />
      </button>
      <span className="w-7 text-center text-base font-black text-ink" aria-live="polite">
        {item.quantity}
      </span>
      <button
        type="button"
        className={button}
        onClick={() => appActions.setQuantity(item.id, item.quantity + 1)}
        disabled={item.quantity >= 20}
        aria-label="One more"
      >
        <Plus size={14} aria-hidden />
      </button>
    </div>
  );
}

/** Tap-to-add requests for one dish; picked ones show in Thai on Order in Thai. */
function RequestChips({ item, options }: { item: OrderItem; options: DishRequest[] }) {
  const [open, setOpen] = useState(false);
  const picked = new Set(item.requests.map((r) => r.id));
  const shown = open ? options : options.filter((o) => picked.has(o.id));
  return (
    <div className="mt-3 border-t border-line pt-3">
      {shown.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {shown.map((o) => {
            const on = picked.has(o.id);
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => appActions.toggleRequest(item.id, o.id)}
                aria-pressed={on}
                className={cn(
                  "flex min-h-9 items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold transition-colors",
                  on ? "border-brand bg-brand-tint text-brand" : "border-line bg-white text-muted hover:border-faint",
                )}
              >
                {on && <Check size={12} strokeWidth={3} aria-hidden />}
                {o.english}
                <span lang="th" className="font-thai font-medium opacity-70">
                  {o.thai}
                </span>
              </button>
            );
          })}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-9 items-center gap-1 text-xs font-bold text-brand"
      >
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} aria-hidden />
        {open ? "Done" : picked.size > 0 ? "Change requests" : "Add a request (e.g. not spicy)"}
      </button>
      {open && (
        <p className="mt-1 text-[11px] leading-relaxed text-subtle">
          Requests are shown to staff in Thai. They&apos;re not a guarantee — always confirm allergies with staff.
        </p>
      )}
    </div>
  );
}

export function OrderSummary() {
  const { items, total, count, options } = useOrder();

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
              <li key={dish.id} className="animate-fade-up rounded-2xl border border-line bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <IconTile icon={DISH_ICONS[dish.icon]} size="md" style={{ background: dish.iconBg, color: dish.iconColor }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-tight font-black text-ink">{dish.aiGuess?.nameEn ?? dish.nameEn}</p>
                    <p lang="th" className="font-thai text-sm text-subtle">
                      {dish.nameThai}
                    </p>
                    <p className="text-sm font-black text-brand">
                      {formatPrice(dish.price, dish.priceFrom)}
                      {dish.quantity > 1 && dish.price !== null && (
                        <span className="ml-1 text-xs font-bold text-subtle">
                          × {dish.quantity} = {formatPrice(dish.price * dish.quantity)}
                        </span>
                      )}
                    </p>
                  </div>
                  <SpeakButton text={dish.nameThai} label={`Listen to ${dish.nameEn} in Thai`} />
                  <button
                    type="button"
                    onClick={() => appActions.toggleDish(dish.id)}
                    aria-label={`Remove ${dish.nameEn}`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-faint transition-colors hover:text-danger"
                  >
                    <Trash2 size={15} aria-hidden />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-muted">How many</span>
                  <QuantityStepper item={dish} />
                </div>
                <RequestChips item={dish} options={options} />
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 lg:sticky lg:top-8">
            <div className="flex items-center justify-between rounded-2xl border border-line bg-white p-4">
              <span className="text-sm font-bold text-muted">{pluralizeDishes(count)}</span>
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
