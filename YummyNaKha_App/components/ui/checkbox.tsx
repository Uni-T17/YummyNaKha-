"use client";

import { useId, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

/** Large tappable checkbox row with a coral check (44px+ target). */
export function Checkbox({ checked, onChange, children, disabled, className }: CheckboxProps) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl py-1 text-sm font-semibold text-ink",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <span className="relative mt-0.5 flex h-6 w-6 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 cursor-pointer appearance-none rounded-lg border-2 border-faint bg-white transition-colors checked:border-brand checked:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed"
        />
        <Check
          size={14}
          strokeWidth={3.5}
          className="pointer-events-none relative m-auto text-white opacity-0 transition-opacity peer-checked:opacity-100"
          aria-hidden
        />
      </span>
      <span className="leading-snug">{children}</span>
    </label>
  );
}
