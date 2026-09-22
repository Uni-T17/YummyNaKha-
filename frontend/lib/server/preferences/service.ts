import "server-only";
import { AvoidReason, PreferenceType } from "@/lib/generated/prisma/client";
import { normalizeTerm } from "@/lib/matching";
import type { AvoidReason as ClientAvoidReason, TasteProfile } from "@/lib/types";
import { prisma } from "../db";
import { errors } from "../http";

// A user's Favs (FAVORITE) and Avoid list (DISLIKE). One row per (user, food
// item) enforced by a unique index, so an item is never both at once: marking
// a disliked item as a favourite (or vice versa) updates that single row.

const MAX_PREFERENCES = 100;

const toDbReason: Record<ClientAvoidReason, AvoidReason> = {
  dislike: AvoidReason.DISLIKE,
  allergy: AvoidReason.ALLERGY,
  doctor: AvoidReason.DOCTOR,
};

const toClientReason: Record<AvoidReason, ClientAvoidReason> = {
  DISLIKE: "dislike",
  ALLERGY: "allergy",
  DOCTOR: "doctor",
};

/** The profile in the shape the frontend already uses (lib/types TasteProfile). */
export async function getTasteProfile(userId: string): Promise<TasteProfile> {
  const rows = await prisma.userPreference.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { type: true, reason: true, label: true },
  });
  return {
    favs: rows.filter((r) => r.type === PreferenceType.FAVORITE).map((r) => r.label),
    avoid: rows
      .filter((r) => r.type === PreferenceType.DISLIKE)
      .map((r) => ({ name: r.label, ...(r.reason ? { reason: toClientReason[r.reason] } : {}) })),
  };
}

function keyFor(name: string) {
  const key = normalizeTerm(name);
  if (!key) throw errors.badRequest("Please enter a food.");
  return key;
}

/**
 * Sets FAVORITE or DISLIKE for one food. Runs in a transaction: the shared
 * FoodItem is upserted, then the user's single preference row is created or
 * switched to the new type.
 */
export async function setPreference(
  userId: string,
  name: string,
  type: PreferenceType,
  reason?: ClientAvoidReason,
): Promise<TasteProfile> {
  const key = keyFor(name);
  const dbReason = type === PreferenceType.DISLIKE && reason ? toDbReason[reason] : null;

  await prisma.$transaction(async (tx) => {
    const foodItem = await tx.foodItem.upsert({
      where: { key },
      create: { key, label: name },
      update: {},
      select: { id: true },
    });

    const existing = await tx.userPreference.findUnique({
      where: { userId_foodItemId: { userId, foodItemId: foodItem.id } },
      select: { id: true },
    });
    if (!existing) {
      const count = await tx.userPreference.count({ where: { userId } });
      if (count >= MAX_PREFERENCES) throw errors.conflict(`You can save up to ${MAX_PREFERENCES} foods.`);
    }

    await tx.userPreference.upsert({
      where: { userId_foodItemId: { userId, foodItemId: foodItem.id } },
      create: { userId, foodItemId: foodItem.id, type, reason: dbReason, label: name },
      update: { type, reason: dbReason, label: name },
    });
  });

  return getTasteProfile(userId);
}

/** Removes a FAVORITE or DISLIKE. Idempotent: removing something absent is not an error. */
export async function removePreference(userId: string, name: string, type: PreferenceType): Promise<TasteProfile> {
  await prisma.userPreference.deleteMany({
    where: { userId, type, foodItem: { key: keyFor(name) } },
  });
  return getTasteProfile(userId);
}

/** Only the flags Gemini needs (LR3): labels and reasons, no identifiers. */
export async function getPreferenceFlags(userId: string) {
  const profile = await getTasteProfile(userId);
  return {
    favorites: profile.favs,
    avoid: profile.avoid.map((a) => ({ name: a.name, reason: a.reason ?? "unspecified" })),
  };
}
