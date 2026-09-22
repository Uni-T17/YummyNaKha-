"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Check, Heart, X } from "lucide-react";
import { FixedBottom } from "@/components/layout/fixed-bottom";
import { useNavVisible } from "@/components/layout/bottom-nav";
import { ReasonBadge } from "@/components/menu/status";
import { Button } from "@/components/ui/button";
import { FavChip, SuggestionChip } from "@/components/ui/chip";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { cn } from "@/lib/cn";
import { FAV_SUGGESTIONS } from "@/lib/mock-data";
import { appActions, useAppState } from "@/lib/store/app-store";
import type { AvoidReason } from "@/lib/types";
import { AddItemInput } from "./add-item-input";
import { AvoidReasonSheet } from "./avoid-reason-sheet";

type Tab = "favs" | "avoid";

export function TasteEditor() {
  const router = useRouter();
  const { profile } = useAppState();
  const navVisible = useNavVisible();
  const [tab, setTab] = useState<Tab>("favs");
  const [pendingAvoid, setPendingAvoid] = useState<string | null>(null);

  const suggestions = FAV_SUGGESTIONS.filter((s) => !profile.favs.some((f) => f.toLowerCase() === s.toLowerCase()));

  function saveAvoid(reason?: AvoidReason) {
    if (pendingAvoid) appActions.addAvoid({ name: pendingAvoid, reason });
    setPendingAvoid(null);
  }

  function handleSave() {
    // TODO(api): PUT /profile. Allergy / doctor-advised items are sensitive
    // health data under PDPA and need an explicit opt-in record server-side.
    appActions.completeOnboarding();
    router.push("/home");
  }

  return (
    <main className={cn("flex flex-1 flex-col", navVisible ? "pb-40" : "pb-28")}>
      <PageHeader title="My Taste" subtitle="Tell us what you love and what you'd rather avoid." />

      <div className="mb-4 px-5 md:px-8 lg:hidden">
        <SegmentedTabs
          label="Taste sections"
          idPrefix="taste"
          value={tab}
          onChange={setTab}
          options={[
            { value: "favs", label: "Favs", icon: Heart },
            { value: "avoid", label: "Avoid", icon: Ban },
          ]}
        />
      </div>

      <div className="grid gap-8 px-5 md:px-8 lg:grid-cols-2 lg:gap-10 lg:pt-2">
        {/* Favs */}
        <section
          role="tabpanel"
          id="taste-panel-favs"
          aria-labelledby="taste-tab-favs"
          className={cn(tab === "favs" ? "block" : "hidden", "lg:block")}
        >
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-ink">
            <Heart size={14} className="text-brand" aria-hidden />
            Your Favs
          </h2>

          <div className="mb-5 flex flex-wrap gap-2">
            {profile.favs.length === 0 ? (
              <p className="text-sm text-subtle">No favs yet — add a few so we can find your top picks.</p>
            ) : (
              profile.favs.map((fav) => <FavChip key={fav} label={fav} onRemove={() => appActions.removeFav(fav)} />)
            )}
          </div>

          <div className="mb-5">
            <AddItemInput placeholder="Add something you love…" label="Add a fav" onSubmit={appActions.addFav} />
          </div>

          {suggestions.length > 0 && (
            <>
              <p className="mb-2 text-xs font-bold tracking-wider text-subtle uppercase">Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <SuggestionChip key={s} label={s} onAdd={() => appActions.addFav(s)} />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Avoid */}
        <section
          role="tabpanel"
          id="taste-panel-avoid"
          aria-labelledby="taste-tab-avoid"
          className={cn(tab === "avoid" ? "block" : "hidden", "lg:block")}
        >
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-ink">
            <Ban size={14} className="text-brand" aria-hidden />
            Your Avoid List
          </h2>

          <ul className="mb-5 flex flex-col gap-2">
            {profile.avoid.length === 0 && (
              <li className="text-sm text-subtle">Nothing to avoid yet. Add allergies, doctor advice or dislikes.</li>
            )}
            {profile.avoid.map((item) => (
              <li
                key={item.name}
                className="flex animate-fade-up items-center justify-between rounded-2xl border border-line bg-white py-2 pr-2 pl-4"
              >
                <div className="flex flex-wrap items-center gap-2 py-1">
                  <span className="text-sm font-bold text-ink">{item.name}</span>
                  {item.reason && <ReasonBadge reason={item.reason} />}
                </div>
                <button
                  type="button"
                  onClick={() => appActions.removeAvoid(item.name)}
                  aria-label={`Remove ${item.name}`}
                  className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-faint transition-colors hover:text-danger"
                >
                  <X size={16} aria-hidden />
                </button>
              </li>
            ))}
          </ul>

          <AddItemInput
            placeholder="Add something to avoid…"
            label="Add to avoid list"
            tone="ink"
            onSubmit={(v) => {
              const exists = profile.avoid.some((a) => a.name.toLowerCase() === v.toLowerCase());
              if (!exists) setPendingAvoid(v);
            }}
          />
        </section>
      </div>

      <FixedBottom aboveNav={navVisible} fade>
        <Button fullWidth onClick={handleSave} className="lg:mx-auto lg:flex lg:max-w-sm">
          <Check size={18} strokeWidth={3} aria-hidden />
          Save My Taste
        </Button>
      </FixedBottom>

      <AvoidReasonSheet item={pendingAvoid} onChoose={saveAvoid} onClose={() => setPendingAvoid(null)} />
    </main>
  );
}
