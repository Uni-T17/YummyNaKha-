"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { useAppState } from "@/lib/store/app-store";

export function HomeHeader() {
  const { user } = useAppState();
  return (
    <header className="flex items-start justify-between px-5 pt-14 pb-5 md:px-8 md:pt-12">
      <div>
        <p className="text-2xl font-black text-brand">YummyNaKha!</p>
        <h1 className="mt-0.5 text-xl font-black text-ink">What are we eating today?</h1>
      </div>
      <Link href="/profile" aria-label="My profile" className="mt-1 rounded-full">
        <Avatar name={user?.name} />
      </Link>
    </header>
  );
}
