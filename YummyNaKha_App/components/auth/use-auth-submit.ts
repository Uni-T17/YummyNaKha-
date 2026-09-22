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

  return { pending, error, setError, run };
}
