import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FixedBottomProps {
  children: ReactNode;
  /** Sit above the bottom tab bar instead of the screen edge. */
  aboveNav?: boolean;
  /** Fade the cream background up behind the content (for sticky CTAs over scroll content). */
  fade?: boolean;
  className?: string;
}

/** A bar pinned to the bottom of the app column, matching its width at every breakpoint. */
export function FixedBottom({ children, aboveNav, fade, className }: FixedBottomProps) {
  return (
    <div
      className={cn(
        "fixed left-1/2 z-30 w-full max-w-(--shell-max) -translate-x-1/2 px-5 md:px-8",
        aboveNav ? "bottom-[calc(4rem+env(safe-area-inset-bottom))]" : "bottom-0 pb-[max(1.5rem,env(safe-area-inset-bottom))]",
        fade && "bg-gradient-to-t from-cream via-cream pt-4",
        fade && aboveNav && "pb-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
