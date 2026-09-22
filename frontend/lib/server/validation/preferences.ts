import { z } from "zod";

const itemName = z
  .string({ error: "Please enter a food." })
  .trim()
  .min(1, "Please enter a food.")
  .max(40, "Keep it under 40 characters.")
  // Letters (any script), numbers, spaces and a little punctuation — no markup.
  .regex(/^[\p{L}\p{M}\p{N} '&(),./-]+$/u, "Use letters, numbers and spaces only.");

export const favoriteSchema = z.object({ name: itemName });

export const dislikeSchema = z.object({
  name: itemName,
  /** Matches the frontend AvoidReason; omitted when the user skipped the question. */
  reason: z.enum(["dislike", "allergy", "doctor"], { error: "Choose a reason from the list." }).optional(),
});

export const removePreferenceSchema = z.object({ name: itemName });
