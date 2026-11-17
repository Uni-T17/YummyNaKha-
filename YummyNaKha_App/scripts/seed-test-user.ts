// Creates (or resets) ONE test account for local development and demos.
//
//   npm run db:seed
//
// The account uses a reserved `.test` email and a test-only password — never a
// real person's address or a real password. It gets two ordinary food
// preferences (no allergy / doctor-advised items, so no health data, LR1) and
// NO consent records: the tester accepts the Terms / AI & Accuracy Disclaimer
// in the app like any new user (LR9). Running it again resets the password
// and the preferences to these values.
//
// Override the defaults with SEED_TEST_EMAIL / SEED_TEST_PASSWORD in .env.
// Refuses to run when NODE_ENV=production.

import "dotenv/config";
import { prisma } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/auth/password";
import { normalizeTerm } from "@/lib/matching";

const EMAIL = (process.env.SEED_TEST_EMAIL || "tester@yummynakha.test").trim().toLowerCase();
/** Test-only value. Do not reuse it anywhere else. */
const PASSWORD = process.env.SEED_TEST_PASSWORD || "yummy-test-only-2026";
const NAME = "Test Diner";

const PREFERENCES = [
  { label: "Chicken", type: "FAVORITE" as const, reason: null },
  { label: "Coriander", type: "DISLIKE" as const, reason: "DISLIKE" as const },
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed a test account with NODE_ENV=production.");
  }
  if (!EMAIL.endsWith(".test")) {
    throw new Error(`SEED_TEST_EMAIL must use the reserved .test domain (got "${EMAIL}").`);
  }
  if (PASSWORD.length < 6 || PASSWORD.length > 128) {
    throw new Error("SEED_TEST_PASSWORD must be 6–128 characters (the app's sign-up rule).");
  }

  const passwordHash = await hashPassword(PASSWORD);
  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    create: { name: NAME, email: EMAIL, passwordHash, onboardedAt: new Date(), spiceTolerance: 1 },
    update: { name: NAME, passwordHash, onboardedAt: new Date(), spiceTolerance: 1 },
    select: { id: true },
  });

  // Signing in again after a reset should start a fresh session.
  await prisma.session.deleteMany({ where: { userId: user.id } });
  await prisma.userPreference.deleteMany({ where: { userId: user.id } });

  for (const pref of PREFERENCES) {
    const key = normalizeTerm(pref.label);
    const food = await prisma.foodItem.upsert({
      where: { key },
      create: { key, label: pref.label },
      update: {},
      select: { id: true },
    });
    await prisma.userPreference.create({
      data: { userId: user.id, foodItemId: food.id, type: pref.type, reason: pref.reason, label: pref.label },
    });
  }

  console.log(`Test account ready: ${EMAIL} (password from SEED_TEST_PASSWORD or the default in scripts/seed-test-user.ts)`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
