-- CreateEnum
CREATE TYPE "PreferenceType" AS ENUM ('FAVORITE', 'DISLIKE');

-- CreateEnum
CREATE TYPE "AvoidReason" AS ENUM ('DISLIKE', 'ALLERGY', 'DOCTOR');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "ConsentAction" AS ENUM ('ACCEPTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "onboardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodItem" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoodItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "foodItemId" TEXT NOT NULL,
    "type" "PreferenceType" NOT NULL,
    "reason" "AvoidReason",
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuImage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "data" BYTEA,
    "status" "ProcessingStatus" NOT NULL DEFAULT 'UPLOADED',
    "extractedText" TEXT,
    "translatedText" TEXT,
    "ocrModel" TEXT,
    "translationModel" TEXT,
    "metadata" JSONB,
    "error" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ProcessingStatus" NOT NULL DEFAULT 'PROCESSING',
    "model" TEXT,
    "preferencesSnapshot" JSONB,
    "result" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuAnalysisImage" (
    "analysisId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,

    CONSTRAINT "MenuAnalysisImage_pkey" PRIMARY KEY ("analysisId","imageId")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "action" "ConsentAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "FoodItem_key_key" ON "FoodItem"("key");

-- CreateIndex
CREATE INDEX "UserPreference_userId_type_idx" ON "UserPreference"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_foodItemId_key" ON "UserPreference"("userId", "foodItemId");

-- CreateIndex
CREATE INDEX "MenuImage_userId_createdAt_idx" ON "MenuImage"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MenuImage_status_idx" ON "MenuImage"("status");

-- CreateIndex
CREATE INDEX "MenuAnalysis_userId_createdAt_idx" ON "MenuAnalysis"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MenuAnalysisImage_imageId_idx" ON "MenuAnalysisImage"("imageId");

-- CreateIndex
CREATE INDEX "ConsentRecord_userId_document_createdAt_idx" ON "ConsentRecord"("userId", "document", "createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuImage" ADD CONSTRAINT "MenuImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuAnalysis" ADD CONSTRAINT "MenuAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuAnalysisImage" ADD CONSTRAINT "MenuAnalysisImage_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "MenuAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuAnalysisImage" ADD CONSTRAINT "MenuAnalysisImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "MenuImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
