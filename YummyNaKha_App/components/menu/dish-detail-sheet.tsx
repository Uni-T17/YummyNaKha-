"use client";

import Link from "next/link";
import { AlertTriangle, Check, ChevronRight, CircleHelp, Flame, Heart, Info, MapPin, ShoppingCart, Sparkles, X } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { SpeakButton } from "@/components/ui/speak-button";
import { cn } from "@/lib/cn";
import { formatPrice, reasonLabel, SPICE_LABELS } from "@/lib/format";
import type { Dish, InferredIngredient, SpiceLevel as Spice } from "@/lib/types";
import { ReportProblem } from "./report-problem";
import { DISH_ICONS, ReasonIcon, StatusBadge } from "./status";

function SpiceLevel({ level }: { level: Spice }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-muted">
      <span className="flex" aria-hidden>
        {[1, 2, 3].map((i) => (
          <Flame key={i} size={12} className={i <= level ? "text-brand" : "text-line"} />
        ))}
      </span>
      {SPICE_LABELS[level]}
    </span>
  );
}

function IngredientList({ title, items }: { title: string; items: InferredIngredient[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-3 last:mb-0">
      <h4 className="mb-1.5 text-xs font-black tracking-wider text-subtle uppercase">{title}</h4>
      <ul className="flex flex-col gap-1.5">
        {items.map((ing) => (
          <li key={ing.key} className="text-sm">
            <span className="font-bold text-ink capitalize">{ing.label}</span>
            {ing.labelThai && (
              <span lang="th" className="font-thai text-subtle">
                {" "}
                · {ing.labelThai}
              </span>
            )}
            {ing.note && <p className="text-xs leading-relaxed text-muted">{ing.note}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface DishDetailSheetProps {
  dish: Dish | null;
  selected: boolean;
  onToggle: () => void;
  onClose: () => void;
  /** Set when the dish can be shown on the menu photo. */
  onShowOnPhoto?: () => void;
  /** Why the dish can't be shown on the photo, when it can't. */
  photoHint?: string;
}

export function DishDetailSheet({ dish, selected, onToggle, onClose, onShowOnPhoto, photoHint }: DishDetailSheetProps) {
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
              <h2 className="text-xl leading-tight font-black text-ink">{dish.aiGuess?.nameEn ?? dish.nameEn}</h2>
              <div className="flex items-center gap-2">
                <p lang="th" className="font-thai text-base font-medium text-subtle">
                  {dish.nameThai}
                </p>
                <SpeakButton text={dish.nameThai} label={`Listen to ${dish.nameEn} in Thai`} />
              </div>
              {dish.nameOnMenu && <p className="text-sm text-subtle">On the menu: {dish.nameOnMenu}</p>}
              <p className="text-lg font-black text-brand">{formatPrice(dish.price, dish.priceFrom)}</p>
            </div>
          </div>

          {onShowOnPhoto && (
            <button
              type="button"
              onClick={onShowOnPhoto}
              className="mb-4 flex w-full items-center gap-3 rounded-2xl border-2 border-brand bg-brand-tint p-3 text-left transition-colors hover:bg-brand-soft active:scale-[0.99]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-sm">
                <MapPin size={20} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-black text-brand">Show on menu photo</span>
                <span className="block text-xs text-muted">See where this dish is on your menu — point at it to order</span>
              </span>
              <ChevronRight size={20} className="shrink-0 text-brand" aria-hidden />
            </button>
          )}

          {dish.aiGuess && (
            <section className="mb-4 rounded-2xl border border-dashed border-line p-4">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-black tracking-wider text-subtle uppercase">
                <Sparkles size={12} aria-hidden />
                AI guess · not from our dish guide
              </p>
              <p className="text-sm leading-relaxed text-body">{dish.aiGuess.description}</p>
              <p className="mt-2 text-xs text-muted">
                Google Gemini guessed this from the dish name. Ingredients it suggested are listed below as &ldquo;often added&rdquo; and only
                ever add warnings. The restaurant&apos;s recipe may differ — ask staff.
              </p>
            </section>
          )}

          {dish.description && (
            <section className="mb-4">
              {dish.romanized && <p className="mb-0.5 text-xs font-bold text-subtle">{dish.romanized}</p>}
              <p className="mb-1.5 text-sm leading-relaxed text-body">{dish.description}</p>
              {dish.spice !== undefined && <SpiceLevel level={dish.spice} />}
            </section>
          )}

          {dish.choiceResults && (
            <section className="mb-4 rounded-2xl border border-line p-4">
              <h3 className="mb-1 text-sm font-black text-ink">Choose your meat</h3>
              <p className="mb-3 text-xs text-muted">This menu lets you pick one. Tell staff your choice — show them the Thai name.</p>
              <p className="mb-3 rounded-xl bg-stone-soft px-3 py-2 text-xs text-muted">
                Want each meat as its own card with its price? Turn on the optional Menu helper in{" "}
                <Link href="/profile/privacy" className="font-bold text-brand hover:underline">
                  Privacy &amp; consents
                </Link>{" "}
                and scan again.
              </p>
              <ul className="flex flex-col gap-2">
                {dish.choiceResults.map((c) => {
                  const ok = c.avoid.length === 0;
                  return (
                    <li key={c.nameThai} className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2">
                        {ok ? (
                          <Check size={14} className="shrink-0 text-success" aria-label="No conflict detected" />
                        ) : (
                          <X size={14} className="shrink-0 text-danger" aria-label="In your Avoid list" />
                        )}
                        <span className="min-w-0">
                          <span lang="th" className={cn("font-thai text-sm font-bold", ok ? "text-ink" : "text-muted line-through")}>
                            {c.nameThai}
                          </span>
                          <span className="ml-1.5 text-xs text-subtle">
                            {c.name}
                            {!ok && ` — ${c.avoid.join(", ")}`}
                          </span>
                        </span>
                      </span>
                      <span className="shrink-0 text-xs font-bold text-muted">{formatPrice(c.price)}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {(dish.uncertainties?.length ?? 0) > 0 && (
            <section className="mb-4 rounded-2xl bg-check-badge p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-black text-check-ink">
                <CircleHelp size={13} aria-hidden />
                Why to check first
              </h3>
              <ul className="flex flex-col gap-1.5">
                {dish.uncertainties!.map((u) => (
                  <li key={u} className="text-xs leading-relaxed text-muted">
                    {u}
                  </li>
                ))}
              </ul>
            </section>
          )}

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

          {dish.ingredients.length > 0 && (
            <section className="mb-4 rounded-2xl border border-line p-4">
              <h3 className="mb-3 text-sm font-black text-ink">What&apos;s usually in it</h3>
              <IngredientList title="Main ingredients" items={dish.ingredients.filter((i) => i.certainty === "listed")} />
              <IngredientList title="Often added" items={dish.ingredients.filter((i) => i.certainty === "common")} />
              <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-subtle">
                From our Thai dish guide, based on the usual recipe. Each restaurant cooks its own way.
              </p>
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

          <ReportProblem key={dish.id} dish={dish} />

          {onShowOnPhoto ? (
            <Button
              variant="outline"
              size="md"
              fullWidth
              className="mb-3 border-2 border-brand bg-brand-tint text-brand hover:bg-brand-soft"
              onClick={onShowOnPhoto}
            >
              <MapPin size={18} aria-hidden />
              Show on menu photo
            </Button>
          ) : (
            photoHint && (
              <p className="mb-3 flex items-center justify-center gap-1.5 text-center text-xs text-subtle">
                <MapPin size={12} aria-hidden />
                {photoHint}
              </p>
            )
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
