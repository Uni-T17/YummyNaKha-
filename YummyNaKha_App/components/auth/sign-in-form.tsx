"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/feedback";
import { PasswordField, TextField } from "@/components/ui/text-field";
import { signIn, signInWithGoogle } from "@/lib/api/auth";
import { GoogleIcon, OrDivider } from "./auth-shell";
import { useAuthSubmit } from "./use-auth-submit";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { pending, error, setError, run } = useAuthSubmit();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    run("form", () => signIn(email, password));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
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
      <PasswordField
        label="Password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setError("");
        }}
        placeholder="Your password"
      />

      <div className="-mt-1 text-right">
        <Link href="/forgot-password" className="text-xs font-bold text-brand hover:underline">
          Forgot password?
        </Link>
      </div>

      <FormError>{error}</FormError>

      <Button type="submit" fullWidth loading={pending === "form"} disabled={pending !== null} loadingLabel="Signing in…">
        Sign In
        <ChevronRight size={18} strokeWidth={2.5} aria-hidden />
      </Button>

      <OrDivider />

      <Button
        variant="google"
        size="md"
        fullWidth
        onClick={() => run("google", signInWithGoogle)}
        loading={pending === "google"}
        disabled={pending !== null}
      >
        <GoogleIcon size={18} />
        Continue with Google
      </Button>

      <p className="mt-2 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-black text-brand hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
