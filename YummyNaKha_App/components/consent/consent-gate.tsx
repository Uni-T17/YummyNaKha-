"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { hasAccepted, REQUIRED_DOCUMENTS } from "@/lib/consent";
import { useConsentRecords } from "./use-consent-records";

/**
 * Blocks menu processing until the Terms bundle and the AI-transfer consent
 * are on record at their current versions (FE2 AC1, AC4 / LR2).
 */
export function ConsentGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { records, error, reload } = useConsentRecords();
  const allowed = records !== null && hasAccepted(records, REQUIRED_DOCUMENTS);

  useEffect(() => {
    if (records && !allowed) router.replace("/consent");
  }, [records, allowed, router]);

  if (error) {
    return (
      <EmptyState
        icon={ShieldAlert}
        tone="danger"
        title={error}
        description="Nothing was sent. Please try again."
        action={
          <Button size="md" onClick={reload}>
            Try again
          </Button>
        }
      />
    );
  }

  if (!allowed) {
    return (
      <div className="flex flex-1 items-center justify-center" role="status" aria-label="Checking your consent">
        <Loader2 size={28} className="animate-spin text-brand" aria-hidden />
      </div>
    );
  }

  return <>{children}</>;
}
