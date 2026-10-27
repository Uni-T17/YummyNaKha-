"use client";

import { useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { BackHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/cn";
import { acceptDocuments, withdrawConsent } from "@/lib/api/consent";
import { ApiError } from "@/lib/api/client";
import { appActions } from "@/lib/store/app-store";
import {
  AI_HELPER_CONSENT,
  CONSENT_DOCUMENTS,
  getConsentStatus,
  HEALTH_CONSENT,
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

/** What happens on withdrawal, and how the consent is usually given, per optional consent. */
const OPTIONAL_CONSENTS: { id: ConsentDocumentId; withdrawNote: string; giveHint: string }[] = [
  {
    id: HEALTH_CONSENT,
    withdrawNote: "This deletes every allergy and doctor-advice reason you saved. The foods stay on your Avoid list without a reason.",
    giveHint: "Given when you first mark a food as an allergy or doctor-advised in My Taste.",
  },
  {
    id: AI_HELPER_CONSENT,
    withdrawNote: "From your next scan, no menu text is sent to Google. Menus that list meats separately show a \"choose your meat\" list instead.",
    giveHint: "Pairs dishes with a menu's meat list using Google Gemini. Only menu text is sent.",
  },
];

/** An optional, withdrawable opt-in (PDPA): health data, or the Gemini menu helper. */
function OptionalConsentRow({ id, withdrawNote, giveHint, status, since, onRead, onChanged }: {
  id: ConsentDocumentId;
  withdrawNote: string;
  giveHint: string;
  status: ConsentStatus;
  since?: string;
  onRead: () => void;
  onChanged: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const doc = CONSENT_DOCUMENTS[id];
  const label = STATUS_LABEL[status];

  async function change(action: "give" | "withdraw") {
    setBusy(true);
    try {
      if (action === "give") await acceptDocuments([id]);
      else await withdrawConsent(id);
      setConfirming(false);
      setError("");
      onChanged();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't save your choice. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white px-4 py-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">{doc.title}</p>
          <p className="mt-0.5 text-xs text-muted">
            Optional · version {doc.version}
            {since && ` · ${status === "withdrawn" ? "withdrawn" : "given"} ${formatDate(since)}`}
          </p>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold", label.className)}>{label.text}</span>
      </div>
      {confirming ? (
        <div className="mt-3 rounded-xl bg-danger-soft px-3 py-3">
          <p className="mb-2.5 text-xs leading-relaxed text-ink">{withdrawNote}</p>
          {error && <p className="mb-2 text-xs font-bold text-danger">{error}</p>}
          <div className="flex gap-2">
            <Button size="xs" variant="danger" className="flex-1 shadow-none" onClick={() => change("withdraw")} disabled={busy}>
              {busy && <Loader2 size={13} className="animate-spin" aria-hidden />}
              Withdraw
            </Button>
            <Button size="xs" variant="outline" className="flex-1" onClick={() => setConfirming(false)} disabled={busy}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <button type="button" onClick={onRead} className="min-h-8 text-xs font-bold text-brand hover:underline">
            Read
          </button>
          {status === "accepted" ? (
            <button type="button" onClick={() => setConfirming(true)} className="min-h-8 text-xs font-bold text-danger hover:underline">
              Withdraw
            </button>
          ) : (
            <button type="button" onClick={() => change("give")} disabled={busy} className="min-h-8 text-xs font-bold text-success hover:underline">
              Allow
            </button>
          )}
        </div>
      )}
      {error && !confirming && <p className="mt-1 text-xs font-bold text-danger">{error}</p>}
      {status !== "accepted" && <p className="mt-1 text-xs text-subtle">{giveHint}</p>}
    </div>
  );
}

export function PrivacySettings() {
  const { records, error: loadError, reload } = useConsentRecords();
  const [reading, setReading] = useState<ConsentDocumentId | null>(null);

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
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs leading-relaxed text-subtle">
              The Terms, Privacy Notice and AI &amp; Accuracy Disclaimer stay in place while you have an account. Your menus are read on our own server. Menu text goes to Google Gemini only if you turn on the optional Menu helper below.
            </p>
          </section>

          <section aria-labelledby="health-heading">
            <h2 id="health-heading" className="mb-2 text-xs font-black tracking-wider text-subtle uppercase">
              Optional
            </h2>
            <div className="flex flex-col gap-3">
              {OPTIONAL_CONSENTS.map(({ id, withdrawNote, giveHint }) => {
                const { status, record } = getConsentStatus(records, id);
                return (
                  <OptionalConsentRow
                    key={id}
                    id={id}
                    withdrawNote={withdrawNote}
                    giveHint={giveHint}
                    status={status}
                    since={record?.timestamp}
                    onRead={() => setReading(id)}
                    onChanged={() => {
                      reload();
                      appActions.reloadProfile();
                    }}
                  />
                );
              })}
            </div>
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

      <DocumentSheet id={reading} onClose={() => setReading(null)} />
    </main>
  );
}
