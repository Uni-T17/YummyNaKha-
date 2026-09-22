import type { AppUser } from "../types";
import { ApiError, apiFetch } from "./client";

// Auth calls to /api/auth/*. The session lives in an httpOnly cookie set by
// the server; the browser never sees a token or password hash.

export interface AuthResult {
  user: AppUser;
  onboarded: boolean;
}

export function signIn(email: string, password: string): Promise<AuthResult> {
  if (!email.trim() || !password.trim()) {
    return Promise.reject(new ApiError("Please enter your email and password."));
  }
  return apiFetch<AuthResult>("/api/auth/login", { body: { email, password } });
}

export function signUp(name: string, email: string, password: string): Promise<AuthResult> {
  if (!name.trim() || !email.trim() || !password.trim()) return Promise.reject(new ApiError("Please fill in all fields."));
  if (password.length < 6) return Promise.reject(new ApiError("Password must be at least 6 characters."));
  return apiFetch<AuthResult>("/api/auth/register", { body: { name, email, password } });
}

// TODO(api): Google sign-in needs OAuth client credentials (not configured).
export async function signInWithGoogle(): Promise<AuthResult> {
  throw new ApiError("Google sign-in isn't available yet. Please use your email and password.");
}

/** Current session, or null when signed out. */
export async function fetchSession(): Promise<AuthResult | null> {
  try {
    return await apiFetch<AuthResult>("/api/auth/me");
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null;
    throw e;
  }
}

export function signOutRequest(): Promise<void> {
  return apiFetch<void>("/api/auth/logout", { method: "POST" });
}

export function markOnboarded(): Promise<AuthResult> {
  return apiFetch<AuthResult>("/api/auth/me", { method: "PATCH", body: { onboarded: true } });
}

// TODO(api): needs an email service to send reset links; still a mock.
export async function requestPasswordReset(email: string): Promise<void> {
  if (!email.trim()) throw new ApiError("Please enter your email.");
  await new Promise((resolve) => setTimeout(resolve, 600));
}

export async function changePassword(current: string, next: string, confirm: string): Promise<void> {
  if (!current || !next || !confirm) throw new ApiError("Please fill in all fields.");
  if (next.length < 6) throw new ApiError("New password must be at least 6 characters.");
  if (next !== confirm) throw new ApiError("New passwords don't match.");
  await apiFetch<void>("/api/auth/password", {
    body: { currentPassword: current, newPassword: next, confirmPassword: confirm },
  });
}

export async function updateUsername(name: string): Promise<string> {
  const clean = name.trim();
  if (!clean) throw new ApiError("Username cannot be empty.");
  const { user } = await apiFetch<AuthResult>("/api/auth/me", { method: "PATCH", body: { name: clean } });
  return user.name;
}
