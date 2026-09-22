"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { FormError, SuccessState } from "@/components/ui/feedback";
import { BackHeader } from "@/components/ui/page-header";
import { PasswordField } from "@/components/ui/text-field";
import { changePassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await changePassword(current, next, confirm);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update your password. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const onField = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setError("");
  };

  return (
    <main className="flex flex-1 flex-col pb-12">
      <BackHeader title="Change Password" backHref="/profile" />
      <div className="mx-auto w-full max-w-md flex-1 px-5">
        {success ? (
          <SuccessState
            className="pt-8"
            title="Password updated!"
            description="Your password has been changed successfully."
            action={
              <ButtonLink href="/profile" fullWidth>
                Back to Profile
              </ButtonLink>
            }
          />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <PasswordField
              label="Current Password"
              autoComplete="current-password"
              value={current}
              onChange={onField(setCurrent)}
              placeholder="Enter current password"
            />
            <PasswordField
              label="New Password"
              autoComplete="new-password"
              value={next}
              onChange={onField(setNext)}
              placeholder="At least 6 characters"
            />
            <PasswordField
              label="Confirm New Password"
              autoComplete="new-password"
              value={confirm}
              onChange={onField(setConfirm)}
              placeholder="Repeat new password"
            />
            <FormError>{error}</FormError>
            <Button type="submit" fullWidth className="mt-2" loading={pending} loadingLabel="Updating…">
              <KeyRound size={18} aria-hidden />
              Update Password
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
