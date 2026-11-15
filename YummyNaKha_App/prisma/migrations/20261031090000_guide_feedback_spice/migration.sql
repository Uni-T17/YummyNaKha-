-- CreateEnum
CREATE TYPE "DishReportProblem" AS ENUM ('NAME', 'INGREDIENTS', 'PRICE', 'OTHER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "spiceTolerance" INTEGER;

-- CreateTable
CREATE TABLE "DishReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "analysisId" TEXT,
    "dishThai" TEXT NOT NULL,
    "dishEn" TEXT NOT NULL,
    "problem" "DishReportProblem" NOT NULL,
    "note" TEXT,
    "guideVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DishReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnlistedDish" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "nameThai" TEXT NOT NULL,
    "timesSeen" INTEGER NOT NULL DEFAULT 1,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnlistedDish_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DishReport_createdAt_idx" ON "DishReport"("createdAt");

-- CreateIndex
CREATE INDEX "DishReport_userId_createdAt_idx" ON "DishReport"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UnlistedDish_key_key" ON "UnlistedDish"("key");

-- CreateIndex
CREATE INDEX "UnlistedDish_timesSeen_idx" ON "UnlistedDish"("timesSeen");

-- AddForeignKey
ALTER TABLE "DishReport" ADD CONSTRAINT "DishReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

