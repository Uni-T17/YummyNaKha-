"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { appActions, useAppState } from "@/lib/store/app-store";
import type { AppUser } from "@/lib/types";

/**
 * Shared submit logic for Sign In / Sign Up / Google: tracks which action is
 * pending, surfaces API errors, stores the user and routes onward
 * (first time → My Taste, returning → Home).
 */
export function useAuthSubmit() {
  const router = useRouter();
  const { hasOnboarded } = useAppState();
  const [pending, setPending] = useState<"form" | "google" | null>(null);
  const [error, setError] = useState("");

  async function run(kind: "form" | "google", action: () => Promise<AppUser>, forceOnboarding = false) {
    setError("");
    setPending(kind);
    try {
      const user = await action();
      appActions.signIn(user);
      router.replace(hasOnboarded && !forceOnboarding ? "/home" : "/taste");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
      setPending(null);
    }
  }

  return { pending, error, setError, run };
}
