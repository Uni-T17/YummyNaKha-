"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, KeyRound, Loader2, LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/feedback";
import { IconTile } from "@/components/ui/icon-tile";
import { BackHeader } from "@/components/ui/page-header";
import { inputClasses } from "@/components/ui/text-field";
import { updateUsername } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { appActions, useAppState } from "@/lib/store/app-store";

const rowLabel = "text-xs font-bold tracking-wider text-subtle uppercase";

function UsernameRow({ name }: { name: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      appActions.updateUserName(await updateUsername(value));
      setEditing(false);
      setError("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setValue(name);
    setError("");
    setEditing(false);
  }

  return (
    <div className="border-b border-line px-4 py-3.5">
      <div className="mb-0.5 flex items-center justify-between">
        <label htmlFor="username" className={rowLabel}>
          Username
        </label>
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setValue(name);
              setEditing(true);
            }}
            className="-m-2 p-2 text-xs font-bold text-brand hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <form
          className="mt-1.5 flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <input
            id="username"
            autoFocus
            type="text"
            value={value}
            maxLength={40}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Escape" && cancel()}
            aria-invalid={!!error}
            className={cn(inputClasses, "bg-cream px-3.5 py-2.5 font-bold")}
          />
          <FieldError>{error}</FieldError>
          <div className="flex gap-2">
            <Button type="submit" size="xs" className="flex-1 shadow-none" disabled={saving}>
              {saving ? <Loader2 size={13} className="animate-spin" aria-hidden /> : <Check size={13} strokeWidth={3} aria-hidden />}
              Save
            </Button>
            <Button type="button" variant="outline" size="xs" className="flex-1" onClick={cancel}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm font-bold text-ink">{name}</p>
      )}
    </div>
  );
}

export function ProfileView() {
  const { user } = useAppState();
  if (!user) return null;

  function signOut() {
    // TODO(api): revoke the session token server-side.
    // RequireAuth sends the signed-out user back to Welcome.
    appActions.signOut();
  }

  return (
    <main className="flex flex-1 flex-col pb-12">
      <BackHeader title="My Profile" backHref="/home" />

      <div className="mx-auto w-full max-w-lg">
        <div className="flex flex-col items-center px-6 pb-8">
          <Avatar name={user.name} size="lg" className="mb-3" />
          <h2 className="text-xl font-black text-ink">{user.name}</h2>
          <p className="mt-0.5 text-sm text-muted">{user.email}</p>
        </div>

        <section aria-label="Account details" className="mx-5 mb-4 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <UsernameRow key={user.name} name={user.name} />
          <div className="px-4 py-3.5">
            <p className={cn(rowLabel, "mb-0.5")}>Email</p>
            <p className="text-sm font-bold break-all text-ink">{user.email}</p>
          </div>
        </section>

        <section aria-label="Account actions" className="mx-5 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <Link
            href="/profile/password"
            className="flex min-h-14 w-full items-center justify-between border-b border-line px-4 py-4 transition-colors hover:bg-cream"
          >
            <span className="flex items-center gap-3">
              <IconTile icon={KeyRound} className="bg-brand-tint text-brand" />
              <span className="text-sm font-bold text-ink">Change Password</span>
            </span>
            <ChevronRight size={16} className="text-subtle" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="flex min-h-14 w-full items-center justify-between px-4 py-4 transition-colors hover:bg-cream"
          >
            <span className="flex items-center gap-3">
              <IconTile icon={LogOut} className="bg-danger-soft text-danger" />
              <span className="text-sm font-bold text-danger">Sign Out</span>
            </span>
            <ChevronRight size={16} className="text-subtle" aria-hidden />
          </button>
        </section>
      </div>
    </main>
  );
}
