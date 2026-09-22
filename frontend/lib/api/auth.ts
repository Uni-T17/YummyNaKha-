import type { AppUser } from "../types";
import { ApiError, createId, simulateLatency } from "./client";

// Mock authentication. No credentials are stored or checked here.
// TODO(api): replace each body with calls to the real auth service
// (email/password + Google OAuth). Per rule.md, store only the session token
// returned by the provider — never the provider password.

export async function signIn(email: string, password: string): Promise<AppUser> {
  if (!email.trim() || !password.trim()) throw new ApiError("Please enter your email and password.");
  await simulateLatency();
  const cleanEmail = email.trim();
  return { id: createId("user"), email: cleanEmail, name: cleanEmail.split("@")[0] };
}

export async function signUp(name: string, email: string, password: string): Promise<AppUser> {
  if (!name.trim() || !email.trim() || !password.trim()) throw new ApiError("Please fill in all fields.");
  if (password.length < 6) throw new ApiError("Password must be at least 6 characters.");
  await simulateLatency();
  return { id: createId("user"), email: email.trim(), name: name.trim() };
}

export async function signInWithGoogle(): Promise<AppUser> {
  await simulateLatency(500);
  return { id: createId("user"), name: "Google User", email: "user@gmail.com" };
}

export async function requestPasswordReset(email: string): Promise<void> {
  if (!email.trim()) throw new ApiError("Please enter your email.");
  await simulateLatency();
}

export async function changePassword(current: string, next: string, confirm: string): Promise<void> {
  if (!current || !next || !confirm) throw new ApiError("Please fill in all fields.");
  if (next.length < 6) throw new ApiError("New password must be at least 6 characters.");
  if (next !== confirm) throw new ApiError("New passwords don't match.");
  await simulateLatency();
}

export async function updateUsername(name: string): Promise<string> {
  const clean = name.trim();
  if (!clean) throw new ApiError("Username cannot be empty.");
  await simulateLatency(300);
  return clean;
}
