import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Right-aligned slot (icon button, avatar…). */
  action?: ReactNode;
  className?: string;
}

/** Large screen title used by the tab screens (My Taste, Your Menu, My Order). */
export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <header className={cn("flex items-start justify-between gap-4 px-5 pt-14 pb-4 md:px-8 md:pt-12", className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-black text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

/** Title with a round back button (My Profile, Change Password). */
export function BackHeader({ title, backHref, backLabel = "Back" }: { title: string; backHref: string; backLabel?: string }) {
  return (
    <header className="flex items-center gap-3 px-5 pt-14 pb-5 md:px-8 md:pt-12">
      <Link
        href={backHref}
        aria-label={backLabel}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-muted transition-colors hover:border-brand hover:text-brand"
      >
        <ChevronLeft size={18} aria-hidden />
      </Link>
      <h1 className="text-xl font-black text-ink">{title}</h1>
    </header>
  );
}
