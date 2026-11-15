import "server-only";
import type { User } from "@/lib/generated/prisma/client";
import { errors } from "../http";
import { getSession } from "./session";

// The only way protected code learns who the caller is: from the server-side
// session. User IDs in request bodies or query strings are never trusted.

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  /** false for an account that only signs in with Google (no password to change or confirm with). */
  hasPassword: boolean;
}

/** Strips every private field (passwordHash, timestamps) before sending a user to the client. */
export function toPublicUser(user: Pick<User, "id" | "name" | "email" | "passwordHash">): PublicUser {
  return { id: user.id, name: user.name, email: user.email, hasPassword: user.passwordHash !== null };
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}

/** Returns the signed-in user or throws 401. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw errors.unauthorized();
  return user;
}
