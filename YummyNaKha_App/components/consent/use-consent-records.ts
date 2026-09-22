"use client";

import { useCallback, useEffect, useState } from "react";
import { getConsentRecords } from "@/lib/api/consent";
import type { ConsentRecord } from "@/lib/consent";
import { useAppState } from "@/lib/store/app-store";

/** Loads the signed-in user's consent records; `reload` re-fetches after a change. */
export function useConsentRecords() {
  const { user } = useAppState();
  const userId = user?.id;
  const [records, setRecords] = useState<ConsentRecord[] | null>(null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    getConsentRecords()
      .then((r) => {
        if (cancelled) return;
        setRecords(r);
        setError("");
      })
      .catch(() => !cancelled && setError("We couldn't load your consent settings."));
    return () => {
      cancelled = true;
    };
  }, [userId, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { userId, records, error, reload };
}
