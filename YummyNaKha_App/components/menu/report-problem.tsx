"use client";

import { useState } from "react";
import { Check, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/feedback";
import { inputClasses } from "@/components/ui/text-field";
import { ApiError } from "@/lib/api/client";
import { reportDish, type DishProblem } from "@/lib/api/reports";
import { cn } from "@/lib/cn";
import { useAppState } from "@/lib/store/app-store";
import type { Dish } from "@/lib/types";

const PROBLEMS: { value: DishProblem; label: string }[] = [
  { value: "name", label: "Wrong name" },
  { value: "ingredients", label: "Wrong ingredients" },
  { value: "price", label: "Wrong price" },
  { value: "other", label: "Something else" },
];

/**
 * "Report a problem" on one dish. The team reads reports to fix the Thai dish
 * guide; only the dish as shown and the diner's short note are sent.
 */
export function ReportProblem({ dish }: { dish: Dish }) {
  const { menuAnalysisId } = useAppState();
  const [open, setOpen] = useState(false);
  const [problem, setProblem] = useState<DishProblem | null>(null);
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  if (state === "sent") {
    return (
      <p className="mb-4 flex items-center justify-center gap-1.5 text-xs font-bold text-success" role="status">
        <Check size={13} strokeWidth={3} aria-hidden />
        Thanks — we&apos;ll check this dish in our guide.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-auto mb-4 flex min-h-11 items-center gap-1.5 px-2 text-xs font-bold text-subtle underline underline-offset-2 hover:text-muted"
      >
        <Flag size={12} aria-hidden />
        Report a problem with this dish
      </button>
    );
  }

  async function send() {
    if (!problem) return;
    setState("sending");
    setError("");
    try {
      await reportDish({
        ...(menuAnalysisId ? { analysisId: menuAnalysisId } : {}),
        dishThai: dish.nameThai,
        dishEn: dish.aiGuess?.nameEn ?? dish.nameEn,
        problem,
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      setState("sent");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't send your report. Please try again.");
      setState("idle");
    }
  }

  return (
    <section aria-labelledby={`report-${dish.id}`} className="mb-4 rounded-2xl border border-line p-4">
      <h3 id={`report-${dish.id}`} className="mb-1 flex items-center gap-1.5 text-sm font-black text-ink">
        <Flag size={13} aria-hidden />
        What&apos;s wrong?
      </h3>
      <p className="mb-3 text-xs text-muted">Your report helps us fix our Thai dish guide for everyone.</p>
      <div role="radiogroup" aria-labelledby={`report-${dish.id}`} className="mb-3 grid grid-cols-2 gap-2">
        {PROBLEMS.map((p) => (
          <button
            key={p.value}
            type="button"
            role="radio"
            aria-checked={problem === p.value}
            onClick={() => setProblem(p.value)}
            className={cn(
              "min-h-11 rounded-xl border px-3 py-2 text-xs font-bold transition-colors",
              problem === p.value ? "border-brand bg-brand-tint text-brand" : "border-line text-muted hover:border-faint",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <label htmlFor={`report-note-${dish.id}`} className="mb-1 block text-xs font-bold text-muted">
        Tell us more (optional)
      </label>
      <textarea
        id={`report-note-${dish.id}`}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={300}
        rows={2}
        placeholder="e.g. this dish has no pork. Please don't include personal details."
        className={cn(inputClasses, "mb-3 resize-none px-3 py-2")}
      />
      <FormError className="mb-3">{error}</FormError>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="flex-1">
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={send}
          disabled={!problem}
          loading={state === "sending"}
          loadingLabel="Sending…"
          className="flex-1 shadow-none"
        >
          Send report
        </Button>
      </div>
    </section>
  );
}
