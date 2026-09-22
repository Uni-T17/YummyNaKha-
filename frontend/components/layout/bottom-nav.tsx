"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, ShoppingBag, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAppState } from "@/lib/store/app-store";

const ITEMS: { href: string; label: string; icon: LucideIcon; matches: string[] }[] = [
  { href: "/home", label: "Home", icon: Home, matches: ["/home", "/menu", "/analyzing"] },
  { href: "/order", label: "My Order", icon: ShoppingBag, matches: ["/order"] },
  { href: "/taste", label: "My Taste", icon: Heart, matches: ["/taste"] },
];

/** Screens that are full-screen in Figma (no tab bar). */
const HIDDEN_ON = ["/analyzing", "/consent", "/order/thai", "/profile"];

export function BottomNav() {
  const pathname = usePathname();
  const { hasOnboarded, selectedIds } = useAppState();

  if (!hasOnboarded || HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav
      aria-label="Main"
      className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-(--shell-max) -translate-x-1/2 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]"
    >
      {ITEMS.map(({ href, label, icon: Icon, matches }) => {
        const active = matches.some((m) => pathname === m || pathname.startsWith(`${m}/`));
        const badge = href === "/order" && selectedIds.length > 0 ? selectedIds.length : null;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-16 flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
              active ? "text-brand" : "text-subtle hover:text-muted",
            )}
          >
            <Icon size={22} aria-hidden />
            <span className="text-xs font-black">{label}</span>
            {badge !== null && (
              <span
                className="absolute top-2 right-[calc(50%-20px)] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[9px] font-black text-white"
                aria-label={`${badge} selected`}
              >
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/** Bottom padding a page needs so its content clears the tab bar. */
export function useNavVisible() {
  const pathname = usePathname();
  const { hasOnboarded } = useAppState();
  return hasOnboarded && !HIDDEN_ON.some((p) => pathname.startsWith(p));
}
