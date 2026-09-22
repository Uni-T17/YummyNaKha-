import { Heart, Plus, X } from "lucide-react";
import { cn } from "@/lib/cn";

/** Removable coral chip for a saved Fav. */
export function FavChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex animate-fade-up items-center gap-1 rounded-full bg-brand-soft py-1.5 pr-1.5 pl-3 text-sm font-bold text-brand">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-brand/10"
      >
        <X size={12} strokeWidth={3} aria-hidden />
      </button>
    </span>
  );
}

/** Outline chip that adds a suggestion when tapped. */
export function SuggestionChip({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="inline-flex min-h-9 items-center gap-1 rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:border-brand hover:text-brand"
    >
      <Plus size={12} strokeWidth={2.5} aria-hidden />
      {label}
    </button>
  );
}

/** Small "matches your Favs" tag on dish cards. */
export function MatchChip({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand",
        className,
      )}
    >
      <Heart size={9} strokeWidth={3} aria-hidden />
      {label}
    </span>
  );
}
