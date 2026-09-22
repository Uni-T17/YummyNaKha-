"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface SegmentedTabsProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  /** id prefix used to link tabs with their panels (`${idPrefix}-panel-${value}`). */
  idPrefix: string;
}

export function SegmentedTabs<T extends string>({ options, value, onChange, label, idPrefix }: SegmentedTabsProps<T>) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 rounded-2xl bg-sand p-1">
      {options.map(({ value: v, label: text, icon: Icon }) => {
        const active = v === value;
        return (
          <button
            key={v}
            role="tab"
            id={`${idPrefix}-tab-${v}`}
            aria-selected={active}
            aria-controls={`${idPrefix}-panel-${v}`}
            onClick={() => onChange(v)}
            className={cn(
              "flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold transition-all",
              active ? "bg-white text-brand shadow-sm" : "text-muted hover:text-ink",
            )}
          >
            {Icon && <Icon size={14} aria-hidden />}
            {text}
          </button>
        );
      })}
    </div>
  );
}
