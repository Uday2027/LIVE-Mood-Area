-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'CONNECTED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CircleStatus" AS ENUM ('ACTIVE', 'DISSOLVED');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('FIRST_PIN', 'VERIFIED_10', 'LOCAL_CROWN', 'MOOD_STREAK_7', 'FIVE_NEIGHBORHOODS', 'PIONEER', 'SOCIAL_BUTTERFLY', 'NIGHT_OWL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bio" VARCHAR(160),
ADD COLUMN     "isGhost" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalPins" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "VibeMatch" (
    "id" TEXT NOT NULL,
    "initiatorId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "initiatorMood" "Mood" NOT NULL,
    "targetMood" "Mood" NOT NULL,
    "distanceMeters" INTEGER NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
    "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VibeMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VibeCircle" (
    "id" TEXT NOT NULL,
    "neighborhoodId" TEXT,
    "mood" "Mood" NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" "CircleStatus" NOT NULL DEFAULT 'ACTIVE',
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dissolvesAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VibeCircle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CircleMember" (
    "id" TEXT NOT NULL,
    "circleId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CircleMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CircleMessage" (
    "id" TEXT NOT NULL,
    "circleId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "content" VARCHAR(300) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CircleMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeType" "BadgeType" NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodStory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "neighborhoodId" TEXT NOT NULL,
    "mood" "Mood" NOT NULL,
    "content" VARCHAR(200),
    "imageUrl" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoodStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryView" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "viewerSession" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProximityPing" (
    "id" TEXT NOT NULL,
    "senderSession" TEXT NOT NULL,
    "receiverSession" TEXT NOT NULL,
    "mood" "Mood" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProximityPing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waitlist" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "referralCode" VARCHAR(12) NOT NULL,
    "referredBy" VARCHAR(12),
    "referralCount" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VibeMatch_initiatorId_status_idx" ON "VibeMatch"("initiatorId", "status");

-- CreateIndex
CREATE INDEX "VibeMatch_targetId_status_idx" ON "VibeMatch"("targetId", "status");

-- CreateIndex
CREATE INDEX "VibeMatch_expiresAt_idx" ON "VibeMatch"("expiresAt");

-- CreateIndex
CREATE INDEX "VibeCircle_status_dissolvesAt_idx" ON "VibeCircle"("status", "dissolvesAt");

-- CreateIndex
CREATE INDEX "VibeCircle_neighborhoodId_status_idx" ON "VibeCircle"("neighborhoodId", "status");

-- CreateIndex
CREATE INDEX "CircleMember_circleId_idx" ON "CircleMember"("circleId");

-- CreateIndex
CREATE UNIQUE INDEX "CircleMember_circleId_sessionId_key" ON "CircleMember"("circleId", "sessionId");

-- CreateIndex
CREATE INDEX "CircleMessage_circleId_createdAt_idx" ON "CircleMessage"("circleId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeType_key" ON "UserBadge"("userId", "badgeType");

-- CreateIndex
CREATE INDEX "MoodStory_neighborhoodId_expiresAt_idx" ON "MoodStory"("neighborhoodId", "expiresAt");

-- CreateIndex
CREATE INDEX "MoodStory_userId_idx" ON "MoodStory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StoryView_storyId_viewerSession_key" ON "StoryView"("storyId", "viewerSession");

-- CreateIndex
CREATE INDEX "ProximityPing_receiverSession_seen_idx" ON "ProximityPing"("receiverSession", "seen");

-- CreateIndex
CREATE INDEX "ProximityPing_expiresAt_idx" ON "ProximityPing"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Waitlist_email_key" ON "Waitlist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Waitlist_referralCode_key" ON "Waitlist"("referralCode");

-- CreateIndex
CREATE INDEX "Waitlist_referralCode_idx" ON "Waitlist"("referralCode");

-- CreateIndex
CREATE INDEX "Waitlist_position_idx" ON "Waitlist"("position");

-- AddForeignKey
ALTER TABLE "VibeCircle" ADD CONSTRAINT "VibeCircle_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhood"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CircleMember" ADD CONSTRAINT "CircleMember_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "VibeCircle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CircleMember" ADD CONSTRAINT "CircleMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CircleMessage" ADD CONSTRAINT "CircleMessage_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "VibeCircle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CircleMessage" ADD CONSTRAINT "CircleMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodStory" ADD CONSTRAINT "MoodStory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodStory" ADD CONSTRAINT "MoodStory_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhood"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryView" ADD CONSTRAINT "StoryView_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "MoodStory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
