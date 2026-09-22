"use client";

import { useId, useState, type ComponentProps } from "react";
import { Eye, EyeOff, Lock, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export const inputClasses =
  "w-full rounded-xl border border-line bg-white text-sm text-ink placeholder:text-subtle transition-colors focus:border-brand focus:outline-none";

export const fieldLabelClasses = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted";

interface TextFieldProps extends Omit<ComponentProps<"input">, "size"> {
  label: string;
  icon?: LucideIcon;
  /** Rendered inside the field on the right (e.g. a show-password toggle). */
  trailing?: React.ReactNode;
}

export function TextField({ label, icon: Icon, trailing, className, id, ...props }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div>
      <label htmlFor={inputId} className={fieldLabelClasses}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-subtle"
            aria-hidden
          />
        )}
        <input
          id={inputId}
          className={cn(inputClasses, "py-3.5", Icon ? "pl-10" : "pl-4", trailing ? "pr-11" : "pr-4", className)}
          {...props}
        />
        {trailing && <div className="absolute top-1/2 right-1.5 -translate-y-1/2">{trailing}</div>}
      </div>
    </div>
  );
}

type PasswordFieldProps = Omit<TextFieldProps, "type" | "icon" | "trailing">;

export function PasswordField(props: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const Toggle = show ? EyeOff : Eye;
  return (
    <TextField
      {...props}
      type={show ? "text" : "password"}
      icon={Lock}
      trailing={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-subtle hover:text-muted"
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
        >
          <Toggle size={16} aria-hidden />
        </button>
      }
    />
  );
}
