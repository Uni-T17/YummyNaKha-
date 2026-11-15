"use client";

import Link from "next/link";
import { ArrowLeft, MessageCircle, ShoppingCart } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { staffPhrases } from "@/lib/staff-phrases";
import { useAppState } from "@/lib/store/app-store";
import { useOrder } from "@/lib/store/use-order";

/** Sentences to show staff, built from the diner's Avoid list and spice level. */
function StaffCards() {
  const { profile } = useAppState();
  const phrases = staffPhrases(profile);
  if (phrases.length === 0) return null;
  return (
    <section aria-labelledby="staff-cards" className="mx-auto w-full max-w-2xl px-5 pb-6">
      <h2 id="staff-cards" className="mb-1 flex items-center gap-1.5 text-sm font-black text-ink">
        <MessageCircle size={14} className="text-brand" aria-hidden />
        <span lang="th" className="font-thai">
          ถามพนักงาน
        </span>
        <span className="font-bold text-subtle">· Ask the staff</span>
      </h2>
      <p className="mb-3 text-xs text-muted">Show a card to your server. Recipes vary — only staff can tell you what goes into your dish.</p>
      <ul className="flex flex-col gap-3">
        {phrases.map((p) => (
          <li key={p.id} className="rounded-2xl border-2 border-line p-4">
            <p lang="th" className="font-thai text-xl leading-snug font-bold text-ink md:text-2xl">
              {p.thai}
            </p>
            <p className="mt-1.5 text-xs text-subtle">{p.english}</p>
            {p.missingThai && (
              <p className="mt-1 text-xs font-semibold text-check-ink">
                We don&apos;t have the Thai word for {p.missingThai} yet — point at the food or show a picture.
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

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
        <StaffCards />
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
              {dish.price !== null && (
                <p className="mt-2 font-thai text-2xl font-black text-brand">{dish.price} บาท</p>
              )}
            </li>
          ))}
        </ul>
        <div className="rounded-2xl bg-brand-tint p-5 text-right">
          <p className="font-thai text-[1.75rem] font-black text-brand">รวม {total} บาท</p>
        </div>
      </div>

      <StaffCards />

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
