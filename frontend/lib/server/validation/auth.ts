import { z } from "zod";

// Server-side validation for auth requests. Limits mirror the existing forms
// (password min. 6 chars per the Sign Up copy) with upper bounds added.

const email = z
  .string({ error: "Please enter your email." })
  .trim()
  .toLowerCase()
  .min(1, "Please enter your email.")
  .max(254, "Email is too long.")
  .pipe(z.email("Please enter a valid email address."));

const name = z
  .string({ error: "Please enter your name." })
  .trim()
  .min(1, "Please enter your name.")
  .max(60, "Name must be 60 characters or fewer.");

const newPassword = z
  .string({ error: "Please enter a password." })
  .min(6, "Password must be at least 6 characters.")
  .max(128, "Password must be 128 characters or fewer.");

export const registerSchema = z.object({ name, email, password: newPassword });

export const loginSchema = z.object({
  email,
  password: z.string({ error: "Please enter your password." }).min(1, "Please enter your password.").max(128),
});

export const updateMeSchema = z
  .object({
    name: name.optional(),
    /** Only `true` is accepted: onboarding can be completed, not undone. */
    onboarded: z.literal(true).optional(),
  })
  .refine((v) => v.name !== undefined || v.onboarded !== undefined, "Nothing to update.");

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Please fill in all fields.").max(128),
    newPassword,
    confirmPassword: z.string().min(1, "Please fill in all fields.").max(128),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "New passwords don't match.",
    path: ["confirmPassword"],
  });
