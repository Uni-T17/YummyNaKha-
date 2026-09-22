"use client";

import Link from "next/link";
import { Ban, Heart } from "lucide-react";
import { summarizeAvoid } from "@/lib/format";
import { useAppState } from "@/lib/store/app-store";

export function TasteSummary() {
  const { profile } = useAppState();
  return (
    <section aria-labelledby="taste-summary" className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 id="taste-summary" className="text-xs font-black tracking-wider text-subtle uppercase">
          Your Taste
        </h2>
        <Link href="/taste" className="-m-2 p-2 text-xs font-bold text-brand hover:underline">
          Edit
        </Link>
      </div>
      <div className="mb-1.5 flex items-start gap-2">
        <Heart size={14} className="mt-0.5 shrink-0 text-brand" aria-label="Favs" />
        <p className="text-sm leading-snug font-semibold text-ink">
          {profile.favs.length ? profile.favs.join(" · ") : <span className="text-subtle">No favs yet</span>}
        </p>
      </div>
      <div className="flex items-start gap-2">
        <Ban size={14} className="mt-0.5 shrink-0 text-danger" aria-label="Avoid" />
        <p className="text-sm leading-snug font-semibold text-ink">
          {profile.avoid.length ? summarizeAvoid(profile.avoid) : <span className="text-subtle">Nothing to avoid</span>}
        </p>
      </div>
    </section>
  );
}
