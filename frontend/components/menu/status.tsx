import { AlertTriangle, Ban, Beef, CookingPot, Fish, Flame, Leaf, Soup, Star, Stethoscope, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { reasonLabel } from "@/lib/format";
import type { AvoidReason, DishIconKey, DishStatus } from "@/lib/types";

// Visual language for the three result categories and the avoid reasons.
// Class strings are static so Tailwind can see them.

export const STATUS_STYLES: Record<
  DishStatus,
  { label: string; icon: LucideIcon; badge: string; card: string; cardSelected: string; border: string }
> = {
  top: {
    label: "Top Pick",
    icon: Star,
    badge: "bg-top-badge text-top-ink",
    card: "bg-top-50",
    cardSelected: "bg-top-100",
    border: "border-top-200",
  },
  check: {
    label: "Check First",
    icon: AlertTriangle,
    badge: "bg-check-badge text-check-ink",
    card: "bg-check-50",
    cardSelected: "bg-check-100",
    border: "border-check-200",
  },
  avoid: {
    label: "Avoid",
    icon: Ban,
    badge: "bg-avoid-badge text-avoid-ink",
    card: "bg-avoid-50",
    cardSelected: "bg-avoid-100",
    border: "border-avoid-200",
  },
};

export function StatusBadge({ status, className }: { status: DishStatus; className?: string }) {
  const { label, icon: Icon, badge } = STATUS_STYLES[status];
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold", badge, className)}
    >
      <Icon size={10} strokeWidth={2.5} aria-hidden />
      {label}
    </span>
  );
}

export function ReasonIcon({ reason, size = 14 }: { reason?: AvoidReason; size?: number }) {
  if (reason === "allergy") return <AlertTriangle size={size} className="shrink-0 text-allergy-icon" aria-hidden />;
  if (reason === "doctor") return <Stethoscope size={size} className="shrink-0 text-doctor-icon" aria-hidden />;
  return null;
}

export const REASON_STYLES: Record<AvoidReason, { chip: string; text: string; tile: string }> = {
  allergy: { chip: "bg-allergy-bg text-allergy-ink", text: "text-allergy-icon", tile: "bg-allergy-bg text-allergy-ink" },
  doctor: { chip: "bg-doctor-bg text-doctor-ink", text: "text-doctor-icon", tile: "bg-doctor-bg text-doctor-ink" },
  dislike: { chip: "bg-stone-soft text-muted", text: "text-muted", tile: "bg-stone-soft text-muted" },
};

export function ReasonBadge({ reason }: { reason: AvoidReason }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        REASON_STYLES[reason].chip,
      )}
    >
      <ReasonIcon reason={reason} size={11} />
      {reasonLabel(reason)}
    </span>
  );
}

export const DISH_ICONS: Record<DishIconKey, LucideIcon> = {
  flame: Flame,
  pot: CookingPot,
  beef: Beef,
  soup: Soup,
  fish: Fish,
  leaf: Leaf,
};
