import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const sizes = {
  sm: { box: "h-8 w-8 rounded-xl", icon: 16 },
  md: { box: "h-12 w-12 rounded-xl", icon: 22 },
  lg: { box: "h-14 w-14 rounded-xl", icon: 26 },
  xl: { box: "h-20 w-20 rounded-2xl", icon: 36 },
} as const;

interface IconTileProps {
  icon: LucideIcon;
  size?: keyof typeof sizes;
  /** Tailwind classes for background + icon colour, e.g. "bg-brand-tint text-brand". */
  className?: string;
  /** Raw colours for data-driven tiles (dish icons). */
  style?: CSSProperties;
}

/** Rounded square holding a single icon — used for features, dishes and menu rows. */
export function IconTile({ icon: Icon, size = "sm", className, style }: IconTileProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex shrink-0 items-center justify-center", s.box, className)} style={style} aria-hidden>
      <Icon size={s.icon} />
    </div>
  );
}
