"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, CircleCheck, FileText, Loader2, Server, ShieldCheck, Sparkles, X, type LucideIcon } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState, FormError } from "@/components/ui/feedback";
import { IconTile } from "@/components/ui/icon-tile";
import { BackHeader } from "@/components/ui/page-header";
import { acceptDocuments } from "@/lib/api/consent";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { getConsentStatus, hasAccepted, TERMS_BUNDLE, type ConsentDocumentId } from "@/lib/consent";
import { OCR_PROVIDER } from "@/lib/ai-provider";
import { formatDate } from "@/lib/format";
import { DocumentSheet } from "./document-sheet";
import { useConsentRecords } from "./use-consent-records";

const SENT =
  OCR_PROVIDER === "gemini"
    ? ["Your menu photos", "Your Favs and Avoid list, with reasons"]
    : ["Your menu photos (to Hugging Face)", "Menu text, Favs and Avoid list with reasons (to Google Gemini)"];
const PROVIDER_NAMES = OCR_PROVIDER === "gemini" ? "the Google Gemini API" : "Hugging Face and the Google Gemini API";
const NEVER_SENT = ["Your name", "Your email address", "Your account details"];

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
  const [transferChecked, setTransferChecked] = useState(false);
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
  const transfer = getConsentStatus(records, "ai-transfer");
  const transferDone = transfer.status === "accepted";
  const remaining = Number(!termsDone && !termsChecked) + Number(!transferDone && !transferChecked);
  const canContinue = remaining === 0;

  async function handleAgree() {
    if (!userId) return;
    setError("");
    setPending(true);
    try {
      await acceptDocuments([...(termsDone ? [] : TERMS_BUNDLE), ...(transferDone ? [] : ["ai-transfer" as const])]);
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
          title="Nothing was sent."
          description="We need your consent to send the menu to our AI providers before we can read it. Your photos stay on this device, and you can come back any time."
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
        <p className="-mt-2 text-sm text-muted">Two quick things, so you know what&apos;s shared and why.</p>

        <StepCard step={1} title="Terms & AI disclaimer" icon={FileText} done={termsDone}>
          <p className="mb-3 rounded-xl bg-check-badge px-3 py-2.5 text-xs leading-relaxed font-semibold text-check-ink">
            AI results can be wrong. A Top Pick is not a safety guarantee — always confirm allergies and medical
            restrictions with restaurant staff.
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

        <StepCard step={2} title="Send your menu to our AI providers" icon={Sparkles} done={transferDone}>
          <p className="mb-3 text-sm leading-relaxed text-body">
            {OCR_PROVIDER === "gemini" ? (
              <>
                To read and sort your menu, we use the <span className="font-bold text-ink">Google Gemini API</span>,
                an external AI provider.
              </>
            ) : (
              <>
                To read and sort your menu, we use two external AI providers:{" "}
                <span className="font-bold text-ink">Hugging Face</span> reads and translates the photo, and the{" "}
                <span className="font-bold text-ink">Google Gemini API</span> matches the dishes to your taste.
              </>
            )}
          </p>

          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-top-50 p-3">
              <p className="mb-1.5 text-xs font-black tracking-wider text-top-ink uppercase">We send</p>
              <ul className="flex flex-col gap-1">
                {SENT.map((item) => (
                  <li key={item} className="flex items-start gap-1.5 text-sm font-semibold text-ink">
                    <Check size={14} strokeWidth={3} className="mt-0.5 shrink-0 text-success" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-stone-soft p-3">
              <p className="mb-1.5 text-xs font-black tracking-wider text-muted uppercase">We never send</p>
              <ul className="flex flex-col gap-1">
                {NEVER_SENT.map((item) => (
                  <li key={item} className="flex items-start gap-1.5 text-sm font-semibold text-ink">
                    <X size={14} strokeWidth={3} className="mt-0.5 shrink-0 text-danger" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mb-3 flex items-start gap-1.5 text-xs leading-relaxed text-muted">
            <Server size={13} className="mt-0.5 shrink-0" aria-hidden />
            Sent from our server, not your device. You can withdraw this any time in My Profile.
          </p>
          <div className="mb-3">
            <ReadLink onClick={() => setReading("ai-transfer")}>Read the full consent</ReadLink>
          </div>

          {transferDone ? (
            <p className="flex items-center gap-1.5 text-sm font-bold text-success">
              <Check size={16} strokeWidth={3} aria-hidden />
              Consent given on {formatDate(transfer.record!.timestamp)}
            </p>
          ) : (
            <>
              {transfer.status === "withdrawn" && (
                <p className="mb-2 text-xs font-semibold text-muted">
                  You withdrew this on {formatDate(transfer.record!.timestamp)}. Give it again to analyze a menu.
                </p>
              )}
              <Checkbox checked={transferChecked} onChange={setTransferChecked}>
                I agree to send this data to {PROVIDER_NAMES} to analyze my menu.
              </Checkbox>
            </>
          )}
        </StepCard>

        <FormError>{error}</FormError>

        <div className="flex flex-col gap-2 pt-1">
          <Button fullWidth disabled={!canContinue} loading={pending} loadingLabel="Saving…" onClick={handleAgree}>
            <Sparkles size={18} aria-hidden />
            {termsDone && transferDone ? "Find My Food" : "Agree & Find My Food"}
          </Button>
          {!canContinue && (
            <p className="text-center text-xs text-subtle" aria-live="polite">
              {remaining === 2 ? "Tick both boxes to continue." : "Tick the remaining box to continue."}
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
