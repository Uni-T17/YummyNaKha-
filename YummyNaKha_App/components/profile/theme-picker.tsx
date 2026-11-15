"use client";

import { useSyncExternalStore } from "react";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/cn";
import { DEFAULT_THEME, readTheme, setTheme, subscribeTheme, THEMES } from "@/lib/theme";

/** Profile → Appearance: pick the app's main colour. Result colours never change. */
export function ThemePicker() {
  const current = useSyncExternalStore(subscribeTheme, readTheme, () => DEFAULT_THEME);

  return (
    <section aria-labelledby="appearance" className="mx-5 mb-4 rounded-2xl border border-line bg-white p-4 shadow-sm">
      <h2 id="appearance" className="mb-0.5 flex items-center gap-2 text-sm font-black text-ink">
        <Palette size={15} className="text-brand" aria-hidden />
        Appearance
      </h2>
      <p className="mb-3 text-xs text-muted">
        Choose the app colour. Top Pick, Check First and Avoid keep their colours so warnings always look the same.
      </p>
      <div role="radiogroup" aria-labelledby="appearance" className="grid grid-cols-5 gap-2">
        {THEMES.map((theme) => {
          const on = theme.id === current;
          return (
            <button
              key={theme.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setTheme(theme.id)}
              className="flex min-h-11 flex-col items-center gap-1.5 rounded-xl py-1.5 transition-transform active:scale-95"
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full ring-offset-2 transition-shadow",
                  on ? "ring-2 ring-ink" : "ring-1 ring-line",
                )}
                style={{ background: theme.swatch }}
              >
                {on && <Check size={18} strokeWidth={3} className="text-white" aria-hidden />}
              </span>
              <span className={cn("text-[11px] font-bold", on ? "text-ink" : "text-muted")}>
                {theme.label}
                {theme.id === DEFAULT_THEME && <span className="sr-only"> (default)</span>}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
