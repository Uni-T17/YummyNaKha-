"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { appActions, useAppState } from "@/lib/store/app-store";

// Client-side guards. The server enforces auth on every API route; these only
// decide which screen to show, based on the session synced from /api/auth/me.

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

  // Confirm the cached session with the server (once per page load).
  useEffect(() => {
    appActions.syncSession();
  }, []);

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

  // A still-valid server session (e.g. a new tab) skips the auth screens.
  useEffect(() => {
    appActions.syncSession();
  }, []);

  useEffect(() => {
    if (hydrated && user) router.replace(hasOnboarded ? "/home" : "/taste");
  }, [hydrated, user, hasOnboarded, router]);

  if (!hydrated || user) return <FullScreenLoader />;
  return <>{children}</>;
}
