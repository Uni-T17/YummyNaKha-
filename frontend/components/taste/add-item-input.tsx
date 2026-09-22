"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { inputClasses } from "@/components/ui/text-field";

interface AddItemInputProps {
  placeholder: string;
  label: string;
  onSubmit: (value: string) => void;
  /** Coral for Favs, ink for the Avoid list (as in Figma). */
  tone?: "brand" | "ink";
}

/** Text input + square add button. Submits on Enter or tap. */
export function AddItemInput({ placeholder, label, onSubmit, tone = "brand" }: AddItemInputProps) {
  const [value, setValue] = useState("");

  function submit() {
    const v = value.trim();
    if (!v) return;
    onSubmit(v);
    setValue("");
  }

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        maxLength={40}
        className={cn(inputClasses, "px-4 py-3")}
      />
      <button
        type="submit"
        aria-label={label}
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white transition-all active:scale-95",
          tone === "brand" ? "bg-brand" : "bg-ink",
        )}
      >
        <Plus size={22} strokeWidth={2.5} aria-hidden />
      </button>
    </form>
  );
}
