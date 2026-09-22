import "server-only";
import type { z } from "zod";
import type { User } from "@/lib/generated/prisma/client";
import { prisma } from "../db";
import { errors, HttpError } from "../http";
import type { changePasswordSchema, loginSchema, registerSchema, updateMeSchema } from "../validation/auth";
import { hashPassword, verifyAgainstDummy, verifyPassword } from "./password";
import { createSession, destroyOtherSessions } from "./session";

const INVALID_CREDENTIALS = "Incorrect email or password.";

export async function registerUser(input: z.infer<typeof registerSchema>): Promise<User> {
  const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) throw errors.conflict("An account with this email already exists. Try signing in.");

  const passwordHash = await hashPassword(input.password);
  let user: User;
  try {
    user = await prisma.user.create({ data: { name: input.name, email: input.email, passwordHash } });
  } catch (e) {
    // Two sign-ups racing for the same email: the unique index decides.
    if ((e as { code?: string }).code === "P2002") {
      throw errors.conflict("An account with this email already exists. Try signing in.");
    }
    throw e;
  }
  await createSession(user.id);
  return user;
}

export async function loginUser(input: z.infer<typeof loginSchema>): Promise<User> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const ok = user ? await verifyPassword(input.password, user.passwordHash) : await verifyAgainstDummy(input.password);
  if (!user || !ok) throw new HttpError(401, "UNAUTHORIZED", INVALID_CREDENTIALS);
  await createSession(user.id);
  return user;
}

export async function updateProfile(userId: string, input: z.infer<typeof updateMeSchema>): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.onboarded ? { onboardedAt: new Date() } : {}),
    },
  });
}

export async function changePassword(user: User, input: z.infer<typeof changePasswordSchema>) {
  const ok = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!ok) {
    throw new HttpError(422, "VALIDATION_ERROR", "Your current password is incorrect.", {
      currentPassword: "Your current password is incorrect.",
    });
  }
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(input.newPassword) } });
  // Any other device signed in with the old password is signed out.
  await destroyOtherSessions(user.id);
}
