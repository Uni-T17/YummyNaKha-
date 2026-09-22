"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAppState } from "@/lib/store/app-store";

// Client-side guards for the mock session. When real auth exists, move the
// signed-in check to proxy.ts (Next 16) using the session cookie and keep these
// only for the onboarding redirect.

function FullScreenLoader() {
  return (
    <div className="flex flex-1 items-center justify-center" role="status" aria-label="Loading">
      <Loader2 size={28} className="animate-spin text-brand" aria-hidden />
    </div>
  );
}

/**
 * Signed-in screens. Sends guests to Sign In, un-onboarded users to My Taste,
 * and a user who just signed out back to Welcome.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { hydrated, user, hasOnboarded } = useAppState();
  const router = useRouter();
  const pathname = usePathname();
  const hadUser = useRef(false);
  const needsOnboarding = !!user && !hasOnboarded && pathname !== "/taste";

  useEffect(() => {
    if (!hydrated) return;
    if (user) hadUser.current = true;
    if (!user) router.replace(hadUser.current ? "/" : "/sign-in");
    else if (needsOnboarding) router.replace("/taste");
  }, [hydrated, user, needsOnboarding, router]);

  if (!hydrated || !user || needsOnboarding) return <FullScreenLoader />;
  return <>{children}</>;
}

/** Auth screens. A signed-in user is sent on to the app. */
export function RequireGuest({ children }: { children: ReactNode }) {
  const { hydrated, user, hasOnboarded } = useAppState();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && user) router.replace(hasOnboarded ? "/home" : "/taste");
  }, [hydrated, user, hasOnboarded, router]);

  if (!hydrated || user) return <FullScreenLoader />;
  return <>{children}</>;
}
