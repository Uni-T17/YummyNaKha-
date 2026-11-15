"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import { useAppState } from "@/lib/store/app-store";

export function HomeHeader() {
  const { user } = useAppState();
  return (
    <header className="flex items-center justify-between gap-3 px-5 pt-12 pb-5 md:px-8 md:pt-10">
      <div className="flex min-w-0 items-center gap-3">
        <Logo width={56} priority className="shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-black text-brand">
            {user?.name ? `Hi, ${user.name.split(" ")[0]}!` : "YummyNaKha!"}
          </p>
          <h1 className="text-xl leading-tight font-black text-ink">What are we eating today?</h1>
        </div>
      </div>
      <Link href="/profile" aria-label="My profile" className="mt-1 rounded-full">
        <Avatar name={user?.name} />
      </Link>
    </header>
  );
}
