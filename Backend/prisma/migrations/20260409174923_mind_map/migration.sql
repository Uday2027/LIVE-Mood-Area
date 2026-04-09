-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('CHILL', 'HYPE', 'FOCUSED', 'ROMANTIC', 'SKETCHY');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('CONFIRM', 'DISPUTE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "reputationScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Neighborhood" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "boundary" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Neighborhood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodPin" (
    "id" TEXT NOT NULL,
    "mood" "Mood" NOT NULL,
    "message" VARCHAR(100),
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "credibilityScore" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "neighborhoodId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoodPin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PinVote" (
    "id" TEXT NOT NULL,
    "pinId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "vote" "VoteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PinVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionReputation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "reputationScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "pinCount" INTEGER NOT NULL DEFAULT 0,
    "disputeCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionReputation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodSnapshot" (
    "id" TEXT NOT NULL,
    "neighborhoodId" TEXT NOT NULL,
    "dominantMood" "Mood",
    "moodScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "pinCount" INTEGER NOT NULL DEFAULT 0,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoodSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Neighborhood_city_idx" ON "Neighborhood"("city");

-- CreateIndex
CREATE INDEX "MoodPin_expiresAt_idx" ON "MoodPin"("expiresAt");

-- CreateIndex
CREATE INDEX "MoodPin_neighborhoodId_expiresAt_idx" ON "MoodPin"("neighborhoodId", "expiresAt");

-- CreateIndex
CREATE INDEX "MoodPin_sessionId_idx" ON "MoodPin"("sessionId");

-- CreateIndex
CREATE INDEX "PinVote_pinId_idx" ON "PinVote"("pinId");

-- CreateIndex
CREATE UNIQUE INDEX "PinVote_pinId_sessionId_key" ON "PinVote"("pinId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionReputation_sessionId_key" ON "SessionReputation"("sessionId");

-- CreateIndex
CREATE INDEX "SessionReputation_sessionId_idx" ON "SessionReputation"("sessionId");

-- CreateIndex
CREATE INDEX "MoodSnapshot_neighborhoodId_recordedAt_idx" ON "MoodSnapshot"("neighborhoodId", "recordedAt");

-- AddForeignKey
ALTER TABLE "MoodPin" ADD CONSTRAINT "MoodPin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodPin" ADD CONSTRAINT "MoodPin_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhood"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PinVote" ADD CONSTRAINT "PinVote_pinId_fkey" FOREIGN KEY ("pinId") REFERENCES "MoodPin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodSnapshot" ADD CONSTRAINT "MoodSnapshot_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhood"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
