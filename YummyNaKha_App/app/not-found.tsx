import { UtensilsCrossed } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
      <IconTile icon={UtensilsCrossed} size="xl" className="mb-6 rounded-3xl bg-brand-tint text-brand" />
      <h1 className="mb-2 text-2xl font-black text-ink">This page isn&apos;t on the menu</h1>
      <p className="mb-8 max-w-xs text-sm text-muted">The link may be broken or the page may have moved.</p>
      <ButtonLink href="/" size="md">
        Back to start
      </ButtonLink>
    </main>
  );
}
