"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, Mail } from "lucide-react";
import { AuthShell } from "./auth-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { FormError, SuccessState } from "@/components/ui/feedback";
import { TextField } from "@/components/ui/text-field";
import { requestPasswordReset } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await requestPasswordReset(email);
      setSentTo(email.trim());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send the link. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell title="Reset password" subtitle={sentTo ? "Check your inbox" : "We'll send you a reset link"}>
      {sentTo ? (
        <SuccessState
          title="Link sent!"
          description={
            <>
              We sent a password reset link to <span className="font-bold text-ink">{sentTo}</span>. Check your inbox and
              follow the instructions.
            </>
          }
          action={
            <ButtonLink href="/sign-in" fullWidth>
              Back to Sign In
            </ButtonLink>
          }
        />
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <p className="-mt-2 text-sm leading-relaxed text-muted">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
          <TextField
            label="Email"
            icon={Mail}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="you@example.com"
          />
          <FormError>{error}</FormError>
          <Button type="submit" fullWidth loading={pending} loadingLabel="Sending…">
            <Mail size={18} aria-hidden />
            Send Reset Link
          </Button>
          <Link
            href="/sign-in"
            className="mx-auto flex min-h-11 items-center justify-center gap-1.5 text-sm font-bold text-subtle hover:text-muted"
          >
            <ChevronLeft size={16} aria-hidden />
            Back to Sign In
          </Link>
        </form>
      )}
    </AuthShell>
  );
}
