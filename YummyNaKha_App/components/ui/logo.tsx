import Image from "next/image";
import { cn } from "@/lib/cn";

/** The YummyNaKha! logo: a smiling face made of a spoon and fork. */
export function Logo({ width = 160, className, priority }: { width?: number; className?: string; priority?: boolean }) {
  return (
    <Image
      src="/logo.png"
      alt="YummyNaKha! logo"
      width={width}
      height={Math.round((width * 661) / 800)}
      priority={priority}
      className={cn("h-auto select-none", className)}
    />
  );
}
