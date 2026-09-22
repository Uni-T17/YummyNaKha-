"use client";

import { AlertTriangle } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
      <IconTile icon={AlertTriangle} size="xl" className="mb-6 rounded-3xl bg-danger-soft text-danger" />
      <h1 className="mb-2 text-2xl font-black text-ink">Something went wrong</h1>
      <p className="mb-8 max-w-xs text-sm text-muted">Please try again. If it keeps happening, go back to the start.</p>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button fullWidth size="md" onClick={reset}>
          Try again
        </Button>
        <ButtonLink href="/" variant="outline" size="md" fullWidth>
          Back to start
        </ButtonLink>
      </div>
    </main>
  );
}
