"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthResult } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { appActions } from "@/lib/store/app-store";

/**
 * Shared submit logic for Sign In / Sign Up / Google: tracks which action is
 * pending, surfaces API errors, stores the user and routes onward
 * (not onboarded yet → My Taste, otherwise → Home).
 */
export function useAuthSubmit() {
  const router = useRouter();
  const [pending, setPending] = useState<"form" | "google" | null>(null);
  const [error, setError] = useState("");

  async function run(kind: "form" | "google", action: () => Promise<AuthResult>) {
    setError("");
    setPending(kind);
    try {
      const { user, onboarded } = await action();
      appActions.signIn(user, onboarded);
      router.replace(onboarded ? "/home" : "/taste");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
      setPending(null);
    }
  }

  /** Google sign-in is a full-page redirect to Google and back (/api/auth/google). */
  function google() {
    setError("");
    setPending("google");
    // A full page load on purpose: an API route that redirects to Google, not a page to route to.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/api/auth/google");
  }

  return { pending, error, setError, run, google };
}
