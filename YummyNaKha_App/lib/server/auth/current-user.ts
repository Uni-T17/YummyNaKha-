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
}

/** Strips every private field (passwordHash, timestamps) before sending a user to the client. */
export function toPublicUser(user: Pick<User, "id" | "name" | "email">): PublicUser {
  return { id: user.id, name: user.name, email: user.email };
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
