import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "dark" | "success" | "outline" | "google" | "ghost";
type Size = "lg" | "md" | "sm" | "xs";

interface StyleProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 select-none transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white font-black shadow-md hover:brightness-105",
  dark: "bg-ink text-white font-black shadow-xl hover:bg-[#292524]",
  success: "bg-success text-white font-black shadow-md",
  outline: "border border-line bg-white text-muted font-bold hover:border-brand hover:text-brand",
  google: "border border-line bg-white text-ink font-bold hover:border-faint",
  ghost: "text-subtle font-bold hover:text-muted",
};

const sizes: Record<Size, string> = {
  lg: "min-h-14 rounded-2xl px-6 py-4 text-base",
  md: "min-h-12 rounded-2xl px-6 py-3.5 text-sm",
  sm: "min-h-11 rounded-xl px-4 py-2.5 text-sm",
  xs: "min-h-9 rounded-xl px-3 py-2 text-xs",
};

export function buttonClasses({ variant = "primary", size = "lg", fullWidth }: StyleProps = {}) {
  return cn(base, variants[variant], sizes[size], fullWidth && "w-full");
}

interface ButtonProps extends ComponentProps<"button">, StyleProps {
  loading?: boolean;
  loadingLabel?: ReactNode;
}

export function Button({
  variant,
  size,
  fullWidth,
  loading,
  loadingLabel,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonClasses({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" aria-hidden />
          {loadingLabel ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link>, StyleProps {}

export function ButtonLink({ variant, size, fullWidth, className, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonClasses({ variant, size, fullWidth }), className)} {...props} />;
}
