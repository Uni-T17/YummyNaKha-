"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, KeyRound, Loader2, LogOut, Mail, ShieldCheck, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/feedback";
import { IconTile } from "@/components/ui/icon-tile";
import { BackHeader } from "@/components/ui/page-header";
import { inputClasses, PasswordField, TextField } from "@/components/ui/text-field";
import { deleteAccount, updateUsername } from "@/lib/api/auth";
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

/** Deletes the account and all its data after the password is entered again (PDPA). */
function DeleteAccountSheet({ open, hasPassword, onClose }: { open: boolean; hasPassword: boolean; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  function close() {
    setPassword("");
    setError("");
    onClose();
  }

  async function confirm() {
    setDeleting(true);
    try {
      await deleteAccount(password);
      // RequireAuth sends the signed-out user back to Welcome.
      appActions.accountDeleted();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't delete your account. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={close} label="Delete account">
      <IconTile icon={Trash2} className="mb-3 bg-danger-soft text-danger" />
      <h2 className="mb-1 text-lg font-black text-ink">Delete your account?</h2>
      <p className="mb-3 text-sm text-muted">This can&apos;t be undone. We permanently delete:</p>
      <ul className="mb-4 flex list-disc flex-col gap-1 pl-5 text-sm text-body">
        <li>your account, name and email</li>
        <li>your Favs and Avoid list, including allergies and doctor advice</li>
        <li>your menu photos, scan results and agreement history</li>
      </ul>
      <p className="mb-4 rounded-xl bg-stone-soft px-3 py-2.5 text-xs leading-relaxed text-muted">
        Thai law (Computer Crime Act §26) requires us to keep access logs — account ID, IP address and time, no food or menu
        data — for at least 90 days. They are deleted after that.
      </p>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          confirm();
        }}
      >
        {hasPassword ? (
          <PasswordField
            label="Enter your password to confirm"
            value={password}
            autoComplete="current-password"
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
        ) : (
          <TextField
            label="Type your email to confirm"
            type="email"
            icon={Mail}
            value={password}
            autoComplete="off"
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
        )}
        <FieldError>{error}</FieldError>
        <Button type="submit" variant="danger" size="md" fullWidth disabled={deleting || !password}>
          {deleting && <Loader2 size={16} className="animate-spin" aria-hidden />}
          Delete my account
        </Button>
        <Button type="button" variant="outline" size="md" fullWidth onClick={close} disabled={deleting}>
          Cancel
        </Button>
      </form>
    </BottomSheet>
  );
}

export function ProfileView() {
  const { user } = useAppState();
  const [deleting, setDeleting] = useState(false);
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
          {user.hasPassword === false ? (
            <div className="flex min-h-14 items-center gap-3 border-b border-line px-4 py-4">
              <IconTile icon={KeyRound} className="bg-stone-soft text-subtle" />
              <span className="text-sm text-muted">Signed in with Google — no password to change.</span>
            </div>
          ) : (
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
          )}
          <Link
            href="/profile/privacy"
            className="flex min-h-14 w-full items-center justify-between border-b border-line px-4 py-4 transition-colors hover:bg-cream"
          >
            <span className="flex items-center gap-3">
              <IconTile icon={ShieldCheck} className="bg-top-50 text-success" />
              <span className="text-sm font-bold text-ink">Privacy &amp; consents</span>
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

        <button
          type="button"
          onClick={() => setDeleting(true)}
          className="mx-auto mt-6 flex min-h-11 items-center gap-1.5 px-4 text-sm font-bold text-subtle hover:text-danger"
        >
          <Trash2 size={14} aria-hidden />
          Delete account
        </button>
      </div>

      <DeleteAccountSheet open={deleting} hasPassword={user.hasPassword !== false} onClose={() => setDeleting(false)} />
    </main>
  );
}
