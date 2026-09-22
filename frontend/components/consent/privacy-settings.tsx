"use client";

import { useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, FormError } from "@/components/ui/feedback";
import { BackHeader } from "@/components/ui/page-header";
import { withdrawConsent } from "@/lib/api/consent";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import {
  CONSENT_DOCUMENTS,
  getConsentStatus,
  REQUIRED_DOCUMENTS,
  type ConsentDocumentId,
  type ConsentStatus,
} from "@/lib/consent";
import { formatDate, formatDateTime } from "@/lib/format";
import { DocumentSheet } from "./document-sheet";
import { useConsentRecords } from "./use-consent-records";

const STATUS_LABEL: Record<ConsentStatus, { text: string; className: string }> = {
  accepted: { text: "Accepted", className: "bg-top-badge text-top-ink" },
  withdrawn: { text: "Withdrawn", className: "bg-avoid-badge text-avoid-ink" },
  outdated: { text: "New version", className: "bg-check-badge text-check-ink" },
  none: { text: "Not given", className: "bg-stone-soft text-muted" },
};

export function PrivacySettings() {
  const { userId, records, error: loadError, reload } = useConsentRecords();
  const [reading, setReading] = useState<ConsentDocumentId | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleWithdraw() {
    if (!userId) return;
    setPending(true);
    setError("");
    try {
      await withdrawConsent("ai-transfer");
      setConfirming(false);
      reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't withdraw. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col pb-12">
      <BackHeader title="Privacy & consents" backHref="/profile" />

      {loadError ? (
        <EmptyState
          icon={ShieldAlert}
          tone="danger"
          title={loadError}
          action={
            <Button size="md" onClick={reload}>
              Try again
            </Button>
          }
        />
      ) : !records ? (
        <div className="flex flex-1 items-center justify-center" role="status" aria-label="Loading">
          <Loader2 size={28} className="animate-spin text-brand" aria-hidden />
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-5">
          <section aria-labelledby="agreements-heading">
            <h2 id="agreements-heading" className="mb-2 text-xs font-black tracking-wider text-subtle uppercase">
              Your agreements
            </h2>
            <ul className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
              {REQUIRED_DOCUMENTS.map((id) => {
                const doc = CONSENT_DOCUMENTS[id];
                const { status, record } = getConsentStatus(records, id);
                const label = STATUS_LABEL[status];
                return (
                  <li key={id} className="border-b border-line px-4 py-3.5 last:border-b-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-ink">{doc.title}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          Version {doc.version}
                          {record && ` · ${status === "withdrawn" ? "withdrawn" : "accepted"} ${formatDate(record.timestamp)}`}
                        </p>
                      </div>
                      <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold", label.className)}>
                        {label.text}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <button
                        type="button"
                        onClick={() => setReading(id)}
                        className="min-h-8 text-xs font-bold text-brand hover:underline"
                      >
                        Read
                      </button>
                      {doc.withdrawable && status === "accepted" && (
                        <button
                          type="button"
                          onClick={() => setConfirming(true)}
                          className="min-h-8 text-xs font-bold text-danger hover:underline"
                        >
                          Withdraw consent
                        </button>
                      )}
                      {doc.withdrawable && status !== "accepted" && (
                        <ButtonLink href="/consent" variant="outline" size="xs">
                          Give consent
                        </ButtonLink>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs leading-relaxed text-subtle">
              The Terms, Privacy Notice and AI Disclaimer stay in place while you have an account.
            </p>
          </section>

          <section aria-labelledby="history-heading">
            <h2 id="history-heading" className="mb-2 text-xs font-black tracking-wider text-subtle uppercase">
              History
            </h2>
            {records.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line px-4 py-5 text-center text-sm text-subtle">
                No agreements recorded yet. You&apos;ll be asked before your first menu scan.
              </p>
            ) : (
              <ol className="overflow-hidden rounded-2xl border border-line bg-white">
                {records.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-start justify-between gap-3 border-b border-line px-4 py-3 text-xs last:border-b-0"
                  >
                    <span>
                      <span className="font-bold text-ink">{CONSENT_DOCUMENTS[r.document].title}</span>
                      <span className="text-muted"> · v{r.version}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className={cn("block font-bold", r.action === "accepted" ? "text-success" : "text-danger")}>
                        {r.action === "accepted" ? "Accepted" : "Withdrawn"}
                      </span>
                      <time dateTime={r.timestamp} className="text-muted">
                        {formatDateTime(r.timestamp)}
                      </time>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}

      <BottomSheet open={confirming} onClose={() => !pending && setConfirming(false)} label="Withdraw consent?">
        <h2 className="mb-2 text-lg font-black text-ink">Withdraw consent?</h2>
        <p className="mb-5 text-sm leading-relaxed text-muted">
          We&apos;ll stop sending your menus and taste profile to our AI providers (Hugging Face and Google Gemini). You won&apos;t be able to analyze a new
          menu until you give consent again. Menus you already analyzed stay on this device until you sign out.
        </p>
        <FormError className="mb-3">{error}</FormError>
        <div className="flex flex-col gap-3">
          <Button
            fullWidth
            size="md"
            className="bg-danger shadow-none hover:brightness-95"
            loading={pending}
            loadingLabel="Withdrawing…"
            onClick={handleWithdraw}
          >
            Withdraw consent
          </Button>
          <Button variant="outline" size="md" fullWidth onClick={() => setConfirming(false)} disabled={pending}>
            Keep it
          </Button>
        </div>
      </BottomSheet>

      <DocumentSheet id={reading} onClose={() => setReading(null)} />
    </main>
  );
}
