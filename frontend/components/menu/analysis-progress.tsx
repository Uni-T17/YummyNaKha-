"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Loader2, Sparkles } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { analyzeMenu, ANALYSIS_STEPS } from "@/lib/api/menu";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { appActions, useAppState } from "@/lib/store/app-store";
import type { ExtractedDish } from "@/lib/types";

const STEP_MS = 650;

export function AnalysisProgress() {
  const router = useRouter();
  const { uploads } = useAppState();
  const [attempt, setAttempt] = useState(0);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<ExtractedDish[] | null>(null);
  const [error, setError] = useState("");

  // Kick off the analysis (runs alongside the step animation).
  useEffect(() => {
    let cancelled = false;
    analyzeMenu(uploads)
      .then((menu) => !cancelled && setResult(menu))
      .catch((e) => !cancelled && setError(e instanceof ApiError ? e.message : "We couldn't read this menu."));
    return () => {
      cancelled = true;
    };
    // Re-run only on retry; uploads can't change while this screen is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  // Advance the checklist; finish once every step is shown and the result is in.
  useEffect(() => {
    if (error) return;
    if (step < ANALYSIS_STEPS.length) {
      const t = setTimeout(() => setStep((s) => s + 1), STEP_MS);
      return () => clearTimeout(t);
    }
    if (!result) return;
    const t = setTimeout(() => {
      appActions.setMenu(result);
      router.replace("/menu");
    }, 700);
    return () => clearTimeout(t);
  }, [step, result, error, router]);

  if (error) {
    return (
      <div role="alert" className="flex w-full max-w-xs animate-fade-up flex-col items-center text-center">
        <IconTile icon={AlertTriangle} size="xl" className="mb-6 rounded-3xl bg-danger-soft text-danger" />
        <h1 className="mb-2 text-2xl font-black text-ink">Couldn&apos;t read the menu</h1>
        <p className="mb-8 text-sm text-muted">{error}</p>
        <div className="flex w-full flex-col gap-3">
          {uploads.length > 0 && (
            <Button
              fullWidth
              onClick={() => {
                setError("");
                setResult(null);
                setStep(0);
                setAttempt((a) => a + 1);
              }}
            >
              Try again
            </Button>
          )}
          <ButtonLink href="/home" variant="outline" size="md" fullWidth>
            Back to Home
          </ButtonLink>
        </div>
      </div>
    );
  }

  const progress = (step / ANALYSIS_STEPS.length) * 100;

  return (
    <div className="flex w-full flex-col items-center">
      <IconTile icon={Loader2} size="xl" className="mb-8 rounded-3xl bg-brand text-white shadow-md [&>svg]:animate-spin" />
      <h1 className="mb-10 text-center text-2xl font-black text-ink">Finding your yummy…</h1>

      <ol className="flex w-full max-w-xs flex-col gap-3.5" aria-live="polite">
        {ANALYSIS_STEPS.map((label, i) => {
          const visible = i < step;
          const isLast = i === ANALYSIS_STEPS.length - 1;
          return (
            <li
              key={label}
              className={cn(
                "flex items-center gap-3 transition-all duration-500",
                visible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
              )}
              aria-hidden={!visible}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-300",
                  visible ? (isLast ? "bg-brand" : "bg-success") : "bg-line",
                )}
              >
                {visible &&
                  (isLast ? (
                    <Sparkles size={12} className="text-white" aria-hidden />
                  ) : (
                    <Check size={12} strokeWidth={3} className="text-white" aria-hidden />
                  ))}
              </span>
              <span className={cn("text-sm font-bold", isLast ? "text-brand" : "text-ink")}>{label}</span>
            </li>
          );
        })}
      </ol>

      <div
        className="mt-10 h-1 w-full max-w-xs overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label="Analysis progress"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full bg-brand transition-all duration-700" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
