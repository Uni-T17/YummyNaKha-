import { z } from "zod";

/** Database IDs are cuids; anything else is rejected before touching the DB. */
export const idSchema = z.string().regex(/^c[a-z0-9]{20,32}$/, "Invalid id.");

export const extractTextSchema = z.object({ imageId: idSchema });

export const analyzeSchema = z.object({
  imageIds: z
    .array(idSchema)
    .min(1, "Add at least one menu image first.")
    .max(10, "Analyze up to 10 menu photos at a time.")
    .refine((ids) => new Set(ids).size === ids.length, "Each photo can be added only once."),
});
