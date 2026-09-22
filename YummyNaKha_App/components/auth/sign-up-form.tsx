"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, CircleUser, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/feedback";
import { PasswordField, TextField } from "@/components/ui/text-field";
import { signInWithGoogle, signUp } from "@/lib/api/auth";
import { GoogleIcon, OrDivider } from "./auth-shell";
import { useAuthSubmit } from "./use-auth-submit";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { pending, error, setError, run } = useAuthSubmit();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    run("form", () => signUp(name, email, password));
  }

  function clearError<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setError("");
    };
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <TextField
        label="Your name"
        icon={CircleUser}
        autoComplete="name"
        value={name}
        onChange={(e) => clearError(setName)(e.target.value)}
        placeholder="How should we call you?"
      />
      <TextField
        label="Email"
        icon={Mail}
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => clearError(setEmail)(e.target.value)}
        placeholder="you@example.com"
      />
      <PasswordField
        label="Password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => clearError(setPassword)(e.target.value)}
        placeholder="Create a password (min. 6 chars)"
      />

      <FormError>{error}</FormError>

      <Button type="submit" fullWidth loading={pending === "form"} disabled={pending !== null} loadingLabel="Creating account…">
        Create Account
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
        Already have an account?{" "}
        <Link href="/sign-in" className="font-black text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
