"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, CircleCheck, FileText, Loader2, Server, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState, FormError } from "@/components/ui/feedback";
import { IconTile } from "@/components/ui/icon-tile";
import { BackHeader } from "@/components/ui/page-header";
import { acceptDocuments } from "@/lib/api/consent";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { getConsentStatus, hasAccepted, TERMS_BUNDLE, type ConsentDocumentId } from "@/lib/consent";
import { formatDate } from "@/lib/format";
import { DocumentSheet } from "./document-sheet";
import { useConsentRecords } from "./use-consent-records";

function StepCard({
  step,
  title,
  icon,
  done,
  children,
}: {
  step: number;
  title: string;
  icon: LucideIcon;
  done?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={`consent-step-${step}`}
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-sm transition-colors md:p-5",
        done ? "border-top-200" : "border-line",
      )}
    >
      <div className="mb-3 flex items-center gap-3">
        <IconTile icon={done ? CircleCheck : icon} className={done ? "bg-top-50 text-success" : "bg-brand-tint text-brand"} />
        <div>
          <p className="text-xs font-bold tracking-wider text-subtle uppercase">Step {step}</p>
          <h2 id={`consent-step-${step}`} className="text-base leading-tight font-black text-ink">
            {title}
          </h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function ReadLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="min-h-8 text-xs font-bold text-brand underline-offset-2 hover:underline">
      {children}
    </button>
  );
}

export function ConsentForm() {
  const router = useRouter();
  const { userId, records, error: loadError, reload } = useConsentRecords();
  const [termsChecked, setTermsChecked] = useState(false);
  const [reading, setReading] = useState<ConsentDocumentId | null>(null);
  const [declined, setDeclined] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (loadError) {
    return (
      <main className="flex flex-1 flex-col">
        <BackHeader title="Before we read your menu" backHref="/home" />
        <EmptyState
          icon={ShieldCheck}
          tone="danger"
          title={loadError}
          action={
            <Button size="md" onClick={reload}>
              Try again
            </Button>
          }
        />
      </main>
    );
  }

  if (!records || !userId) {
    return (
      <main className="flex flex-1 items-center justify-center" role="status" aria-label="Loading">
        <Loader2 size={28} className="animate-spin text-brand" aria-hidden />
      </main>
    );
  }

  const termsDone = hasAccepted(records, TERMS_BUNDLE);
  const canContinue = termsDone || termsChecked;

  async function handleAgree() {
    if (!userId) return;
    setError("");
    setPending(true);
    try {
      if (!termsDone) await acceptDocuments(TERMS_BUNDLE);
      router.replace("/analyzing");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't save your choice. Please try again.");
      setPending(false);
    }
  }

  if (declined) {
    return (
      <main className="flex flex-1 flex-col">
        <BackHeader title="Before we read your menu" backHref="/home" />
        <EmptyState
          icon={ShieldCheck}
          title="Nothing was read."
          description="We need you to accept the terms before we read a menu. Nothing has been processed, and you can come back any time."
          action={
            <div className="flex w-64 flex-col gap-3">
              <Button size="md" fullWidth onClick={() => setDeclined(false)}>
                Review again
              </Button>
              <ButtonLink href="/home" variant="outline" size="md" fullWidth>
                Back to Home
              </ButtonLink>
            </div>
          }
        />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col pb-12">
      <BackHeader title="Before we read your menu" backHref="/home" />

      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-5 md:px-8">
        <p className="-mt-2 text-sm text-muted">One quick thing, so you know how your menu is read.</p>

        <StepCard step={1} title="Terms & accuracy disclaimer" icon={FileText} done={termsDone}>
          <p className="mb-3 rounded-xl bg-check-badge px-3 py-2.5 text-xs leading-relaxed font-semibold text-check-ink">
            Results can be wrong — menus are read automatically and recipes vary. A Top Pick is not a safety
            guarantee — always confirm allergies and medical restrictions with restaurant staff.
          </p>
          <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1">
            <ReadLink onClick={() => setReading("terms")}>Terms of Use</ReadLink>
            <ReadLink onClick={() => setReading("privacy")}>Privacy Notice</ReadLink>
            <ReadLink onClick={() => setReading("ai-disclaimer")}>AI &amp; Accuracy Disclaimer</ReadLink>
          </div>
          {termsDone ? (
            <p className="flex items-center gap-1.5 text-sm font-bold text-success">
              <Check size={16} strokeWidth={3} aria-hidden />
              Accepted on {formatDate(getConsentStatus(records, "terms").record!.timestamp)}
            </p>
          ) : (
            <Checkbox checked={termsChecked} onChange={setTermsChecked}>
              I accept the Terms of Use, Privacy Notice and AI &amp; Accuracy Disclaimer.
            </Checkbox>
          )}
        </StepCard>

        <section className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm md:p-5">
          <Server size={18} className="mt-0.5 shrink-0 text-success" aria-hidden />
          <p className="text-sm leading-relaxed text-body">
            Your menu photo is read on <span className="font-bold text-ink">our own server</span> and checked against our
            Thai dish guide. Your photos, food profile and account details are{" "}
            <span className="font-bold text-ink">not sent to any outside AI provider</span>.
          </p>
        </section>

        <FormError>{error}</FormError>

        <div className="flex flex-col gap-2 pt-1">
          <Button fullWidth disabled={!canContinue} loading={pending} loadingLabel="Saving…" onClick={handleAgree}>
            <Sparkles size={18} aria-hidden />
            {termsDone ? "Find My Food" : "Agree & Find My Food"}
          </Button>
          {!canContinue && (
            <p className="text-center text-xs text-subtle" aria-live="polite">
              Tick the box to continue.
            </p>
          )}
          <Button variant="ghost" size="md" fullWidth onClick={() => setDeclined(true)} disabled={pending}>
            Not now
          </Button>
        </div>
      </div>

      <DocumentSheet id={reading} onClose={() => setReading(null)} />
    </main>
  );
}
