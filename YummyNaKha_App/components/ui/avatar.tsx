import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/format";

const sizes = {
  sm: "h-10 w-10 text-sm shadow-sm",
  lg: "h-20 w-20 text-2xl shadow-md",
} as const;

/** Coral initials avatar. */
export function Avatar({ name, size = "sm", className }: { name?: string; size?: keyof typeof sizes; className?: string }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand font-black text-white",
        sizes[size],
        className,
      )}
      aria-hidden
    >
      {getInitials(name)}
    </span>
  );
}
