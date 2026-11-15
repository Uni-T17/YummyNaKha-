"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownUp,
  Camera,
  ChevronRight,
  Image as ImageIcon,
  Info,
  ListOrdered,
  Loader2,
  ScanLine,
  Search,
  SearchX,
  Sparkles,
  ThumbsUp,
  X,
} from "lucide-react";
import { FixedBottom } from "@/components/layout/fixed-bottom";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { cn } from "@/lib/cn";
import { pluralizeDishes } from "@/lib/format";
import { appActions, useAppState, useDishes } from "@/lib/store/app-store";
import { useMenuPhotos } from "@/lib/store/use-menu-photos";
import type { Dish, MenuFilter, OtherMenuLine, PhotoSpot } from "@/lib/types";
import { DishCard } from "./dish-card";
import { DishDetailSheet } from "./dish-detail-sheet";
import { FoodWarningSheet } from "./food-warning-sheet";
import { MenuPhotoSheet } from "./menu-photo-sheet";

const FILTERS: { value: MenuFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "top", label: "Top Picks" },
  { value: "check", label: "Check First" },
  { value: "avoid", label: "Avoid" },
];

/** What the "Not in our dish guide" section says while / after the Menu helper looks dishes up. */
const LOOKUP_NOTE: Record<string, string> = {
  pending: "Our AI menu helper is looking these up…",
  done: "Names, descriptions and ingredients below are AI guesses, not from our dish guide. Always ask staff.",
  off: "We don't know these dishes yet — ask staff what's in them. Turn on the optional Menu helper in Privacy & consents for AI guesses.",
  unavailable:
    "We don't know these dishes yet — ask staff what's in them. (The AI menu helper didn't answer this time.)",
  idle: "We don't know these dishes yet — ask staff what's in them.",
};

type View = "match" | "menu";
type Sort = "best" | "price-low" | "price-high";

const SORTS: { value: Sort; label: string }[] = [
  { value: "best", label: "Best match" },
  { value: "price-low", label: "Cheapest" },
  { value: "price-high", label: "Priciest" },
];

/** Case-insensitive match on every name we show for a dish. */
function matchesSearch(dish: Dish, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    dish.nameEn,
    dish.nameThai,
    dish.nameOnMenu,
    dish.romanized,
    dish.aiGuess?.nameEn,
  ].some((name) => name?.toLowerCase().includes(q));
}

/** Price order; dishes without a printed price go last. Array sort is stable, so ties keep the best-match order. */
function sortDishes(list: Dish[], sort: Sort) {
  if (sort === "best") return list;
  const dir = sort === "price-low" ? 1 : -1;
  return [...list].sort((a, b) => {
    if (a.price === null || b.price === null)
      return Number(a.price === null) - Number(b.price === null);
    return (a.price - b.price) * dir;
  });
}

const VIEWS: { value: View; label: string; icon: typeof ThumbsUp }[] = [
  { value: "match", label: "Best for me", icon: ThumbsUp },
  { value: "menu", label: "Menu order", icon: ListOrdered },
];

/** A line read from the menu that isn't a dish we know: a heading, or a dish to ask staff about. */
function OtherLine({ line }: { line: OtherMenuLine }) {
  return (
    <p
      lang="th"
      className="mx-5 rounded-xl border border-dashed border-line px-3 py-2 font-thai text-sm font-bold text-muted md:mx-8"
    >
      {line.text}
    </p>
  );
}

export function MenuResults() {
  const dishes = useDishes();
  const {
    selectedIds,
    aiLookup,
    menu,
    menuOtherLines: otherLines,
  } = useAppState();
  // The server deletes photos once read; the Menu screen uses the copy kept in this browser (lib/photo-cache.ts).
  // Same order as the scan's pages, so a dish's spot.page points at the right photo; a lost one is undefined.
  const pagePhotos = useMenuPhotos();
  const photos = pagePhotos.filter((url): url is string => !!url);

  // Resume a lookup that was interrupted by a page reload.
  useEffect(() => {
    if (aiLookup === "idle") appActions.lookUpUnlisted();
  }, [aiLookup]);
  const [filter, setFilter] = useState<MenuFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  /** The dish to highlight on the photo ("Show on menu photo"). */
  const [photoSpot, setPhotoSpot] = useState<PhotoSpot | null>(null);
  const [view, setView] = useState<View>("match");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("best");

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

  const searching = query.trim().length > 0;
  const visible = sortDishes(
    (filter === "all"
      ? dishes
      : dishes.filter((d) => d.status === filter)
    ).filter((d) => matchesSearch(d, query)),
    view === "match" ? sort : "best",
  );
  // Dishes from our guide first; the ones we don't know get their own section below.
  const listed = visible.filter((d) => d.inGuide !== false);
  const unlisted = visible.filter((d) => d.inGuide === false);
  const cards = (list: Dish[]) => (
    <div className="grid gap-3 px-5 md:grid-cols-2 md:gap-4 md:px-8 lg:grid-cols-3">
      {list.map((dish) => (
        <DishCard
          key={dish.id}
          dish={dish}
          selected={selectedIds.includes(dish.id)}
          onToggle={() => appActions.toggleDish(dish.id)}
          onOpen={() => setOpenId(dish.id)}
        />
      ))}
    </div>
  );
  // "Menu order": dishes in the order printed on the menu, with the other lines
  // (headings, dishes we couldn't recognise) in their places, like the paper menu.
  const position = new Map((menu ?? []).map((d, i) => [d.id, i]));
  const at = (d: Dish) => position.get(d.id) ?? 0;
  const showLines = filter === "all" && !searching;
  const menuBlocks: ({ line: OtherMenuLine } | { dishes: Dish[] })[] = [];
  let nextLine = 0;
  for (const dish of [...visible].sort((a, b) => at(a) - at(b))) {
    while (
      showLines &&
      nextLine < otherLines.length &&
      otherLines[nextLine].before <= at(dish)
    ) {
      menuBlocks.push({ line: otherLines[nextLine++] });
    }
    const last = menuBlocks[menuBlocks.length - 1];
    if (last && "dishes" in last) last.dishes.push(dish);
    else menuBlocks.push({ dishes: [dish] });
  }
  while (showLines && nextLine < otherLines.length)
    menuBlocks.push({ line: otherLines[nextLine++] });

  const openDish = dishes.find((d) => d.id === openId) ?? null;
  const hasSelection = selectedIds.length > 0;

  return (
    <main
      className={cn("flex flex-1 flex-col", hasSelection ? "pb-40" : "pb-24")}
    >
      <PageHeader
        title="Your Menu"
        subtitle="Picked for your taste"
        className="items-center pb-2"
        action={
          <div className="flex gap-2">
            {photos.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setPhotoSpot(null);
                  setShowPhoto(true);
                }}
                aria-label="See your menu photo"
                className="flex h-10 items-center gap-1.5 rounded-full border border-line bg-white px-3.5 text-xs font-bold text-ink transition-colors hover:border-brand hover:text-brand"
              >
                <ImageIcon size={15} aria-hidden />
                Photo
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowInfo(true)}
              aria-label="About food warnings"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-muted transition-colors hover:border-brand hover:text-brand"
            >
              <Info size={16} aria-hidden />
            </button>
          </div>
        }
      />

      <div className="px-5 pt-1 md:px-8">
        <p
          className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted"
          role="status"
        >
          <span className="font-black text-ink">
            {pluralizeDishes(dishes.length)} found
          </span>
          {otherLines.length > 0 && (
            <span>
              · {otherLines.length} other{" "}
              {otherLines.length === 1 ? "line" : "lines"}
            </span>
          )}
          <span aria-hidden>·</span>
          <Link
            href="/home"
            className="inline-flex min-h-8 items-center gap-1 font-bold text-brand underline underline-offset-2"
          >
            <Camera size={12} aria-hidden />
            Missing some? Rescan closer
          </Link>
        </p>
        <div className="mt-3">
          <SegmentedTabs
            options={VIEWS}
            value={view}
            onChange={setView}
            label="Show dishes"
            idPrefix="menu-view"
          />
        </div>
      </div>

      <div
        role="group"
        aria-label="Filter dishes"
        className="scrollbar-hide flex gap-2 overflow-x-auto px-5 py-3 md:px-8"
      >
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
                active
                  ? "bg-brand text-white"
                  : "border border-line bg-white text-muted hover:text-ink",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 px-5 pb-4 md:px-8">
        <label className="relative flex-1">
          <span className="sr-only">Search dishes</span>
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-subtle"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search, e.g. tom yum"
            className="min-h-11 w-full rounded-xl border border-line bg-white py-2 pr-10 pl-10 text-sm text-ink placeholder:text-faint focus:border-brand focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {searching && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-1 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-subtle hover:text-ink"
            >
              <X size={15} aria-hidden />
            </button>
          )}
        </label>
        {view === "match" && (
          <label className="relative flex shrink-0 items-center">
            <span className="sr-only">Sort dishes</span>
            <ArrowDownUp
              size={14}
              className="pointer-events-none absolute left-3 text-muted"
              aria-hidden
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="min-h-11 appearance-none rounded-xl border border-line bg-white py-2 pr-3 pl-8 text-sm font-bold text-ink focus:border-brand focus:outline-none"
            >
              {SORTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div
        role="tabpanel"
        id={`menu-view-panel-${view}`}
        aria-labelledby={`menu-view-tab-${view}`}
      >
        {visible.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={
              searching
                ? `No dishes match “${query.trim()}”.`
                : "No dishes in this group."
            }
            description={
              searching
                ? "Try another word, in English or Thai."
                : "Try another filter to see the rest of the menu."
            }
            className="py-12"
          />
        ) : view === "menu" ? (
          <div className="flex flex-col gap-3">
            {showLines && otherLines.length > 0 && (
              <p className="px-5 text-xs leading-relaxed text-muted md:px-8">
                Dashed lines are text we read but couldn&apos;t match to a dish:
                headings, or dishes to ask staff about.
              </p>
            )}
            {menuBlocks.map((block, i) =>
              "line" in block ? (
                <OtherLine key={`line-${i}`} line={block.line} />
              ) : (
                <div key={`dishes-${i}`}>{cards(block.dishes)}</div>
              ),
            )}
          </div>
        ) : (
          <>
            {cards(listed)}
            {unlisted.length > 0 && (
              <section
                aria-labelledby="unlisted-heading"
                className={cn(listed.length > 0 && "mt-8")}
              >
                <div className="mb-3 px-5 md:px-8">
                  <h2
                    id="unlisted-heading"
                    className="text-sm font-black text-ink"
                  >
                    Not in our dish guide · {pluralizeDishes(unlisted.length)}
                  </h2>
                  <p
                    className="mt-0.5 flex items-start gap-1.5 text-xs leading-relaxed text-muted"
                    aria-live="polite"
                  >
                    {aiLookup === "pending" ? (
                      <Loader2
                        size={13}
                        className="mt-0.5 shrink-0 animate-spin text-brand"
                        aria-hidden
                      />
                    ) : aiLookup === "done" ? (
                      <Sparkles
                        size={13}
                        className="mt-0.5 shrink-0 text-brand"
                        aria-hidden
                      />
                    ) : null}
                    {LOOKUP_NOTE[aiLookup]}
                  </p>
                </div>
                {cards(unlisted)}
              </section>
            )}
            {showLines && otherLines.length > 0 && (
              <details className="group mt-8">
                <summary className="mx-5 flex min-h-11 cursor-pointer list-none items-center justify-between rounded-2xl border border-line px-4 py-2 md:mx-8">
                  <span>
                    <span className="block text-sm font-black text-ink">
                      Other text on the menu · {otherLines.length}
                    </span>
                    <span className="block text-xs text-muted">
                      Headings, or dishes we couldn&apos;t recognise. Ask staff
                      about these.
                    </span>
                  </span>
                  <ChevronRight
                    size={16}
                    className="shrink-0 text-subtle transition-transform group-open:rotate-90"
                    aria-hidden
                  />
                </summary>
                <div className="mt-3 flex flex-col gap-2">
                  {otherLines.map((line, i) => (
                    <OtherLine key={i} line={line} />
                  ))}
                </div>
              </details>
            )}
          </>
        )}
      </div>

      {hasSelection && (
        <FixedBottom aboveNav className="pb-2">
          <Link
            href="/order"
            className="flex min-h-14 w-full animate-fade-up items-center justify-between rounded-2xl bg-ink px-5 py-4 font-black text-white shadow-xl transition-transform active:scale-[0.98] lg:mx-auto lg:max-w-md"
          >
            <span className="text-sm font-bold">
              {pluralizeDishes(selectedIds.length)} selected
            </span>
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
        onShowOnPhoto={
          openDish?.spot && pagePhotos[openDish.spot.page]
            ? () => {
                setPhotoSpot(openDish.spot!);
                setOpenId(null);
                setShowPhoto(true);
              }
            : undefined
        }
        photoHint={
          !openDish?.spot
            ? "Scan this menu again to see dishes on your photo."
            : "Your menu photo isn't on this device any more. Scan again to see this dish on it."
        }
      />
      <FoodWarningSheet open={showInfo} onClose={() => setShowInfo(false)} />
      <MenuPhotoSheet
        open={showPhoto}
        onClose={() => setShowPhoto(false)}
        photos={pagePhotos}
        highlight={photoSpot}
      />
    </main>
  );
}
