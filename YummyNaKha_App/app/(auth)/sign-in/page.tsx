import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ google?: string }> }) {
  const { google } = await searchParams;
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your YummyNaKha! account">
      <SignInForm googleError={google} />
    </AuthShell>
  );
}
