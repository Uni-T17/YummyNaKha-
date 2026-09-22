import type { ReactNode } from "react";
import { AlertTriangle, Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/** Inline form error (Figma: red-50 pill with a warning icon). */
export function FormError({ children, className }: { children: ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className={cn(
        "flex items-center gap-2 rounded-xl bg-danger-soft px-3 py-2.5 text-xs font-semibold text-danger-ink",
        className,
      )}
    >
      <AlertTriangle size={13} className="shrink-0" aria-hidden />
      {children}
    </div>
  );
}

/** Small field-level error text. */
export function FieldError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="flex items-center gap-1 text-xs font-semibold text-danger-ink">
      <AlertTriangle size={11} aria-hidden />
      {children}
    </p>
  );
}

interface StateProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Green check confirmation used after reset-link / password-change. */
export function SuccessState({ title, description, action, className }: StateProps) {
  return (
    <div role="status" className={cn("flex animate-fade-up flex-col items-center gap-5 text-center", className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-soft">
        <Check size={28} strokeWidth={3} className="text-success" aria-hidden />
      </div>
      <div>
        <p className="mb-1 font-black text-ink">{title}</p>
        {description && <p className="text-sm leading-relaxed text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Neutral empty / error placeholder (Figma: My Order empty state). */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "neutral",
  className,
}: StateProps & { icon: LucideIcon; tone?: "neutral" | "danger" }) {
  return (
    <div className={cn("flex flex-1 flex-col items-center justify-center px-8 py-16 text-center", className)}>
      <div
        className={cn(
          "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl",
          tone === "danger" ? "bg-danger-soft" : "bg-stone-soft",
        )}
      >
        <Icon size={28} className={tone === "danger" ? "text-danger" : "text-subtle"} aria-hidden />
      </div>
      <p className="font-bold text-muted">{title}</p>
      {description && <p className="mt-1 max-w-xs text-sm text-subtle">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
