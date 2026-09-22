"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { useOrder } from "@/lib/store/use-order";

/** Large-type order in Thai, for showing restaurant staff at arm's length. */
export function ThaiOrder() {
  const { items, total } = useOrder();

  if (items.length === 0) {
    return (
      <main className="flex flex-1 flex-col bg-white">
        <EmptyState
          icon={ShoppingCart}
          title="No dishes selected yet."
          description="Pick dishes from your menu first, then show them here in Thai."
          action={
            <ButtonLink href="/menu" size="md" className="shadow-none">
              Browse Menu
            </ButtonLink>
          }
        />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col bg-white">
      <header className="border-b border-line px-5 pt-14 pb-6 text-center md:pt-12">
        <p className="mb-2 text-xs font-bold tracking-widest text-subtle uppercase">Show this to your server</p>
        <h1 lang="th" className="font-thai text-2xl font-bold text-ink">
          รายการที่ต้องการสั่ง
        </h1>
      </header>

      <div lang="th" className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-5 py-6">
        <ul className="flex flex-col gap-4">
          {items.map((dish) => (
            <li key={dish.id} className="rounded-2xl border-2 border-line p-5">
              <p className="font-thai text-[2rem] leading-[1.3] font-bold text-ink md:text-[2.5rem]">{dish.nameThai}</p>
              <p className="mt-2 font-thai text-2xl font-black text-brand">{dish.price} บาท</p>
            </li>
          ))}
        </ul>
        <div className="rounded-2xl bg-brand-tint p-5 text-right">
          <p className="font-thai text-[1.75rem] font-black text-brand">รวม {total} บาท</p>
        </div>
      </div>

      <div className="px-5 pb-12 text-center">
        <Link
          href="/order"
          className="mx-auto inline-flex min-h-11 items-center justify-center gap-1.5 text-sm font-bold text-subtle underline underline-offset-2 hover:text-muted"
        >
          <ArrowLeft size={14} aria-hidden />
          Back to English
        </Link>
      </div>
    </main>
  );
}
