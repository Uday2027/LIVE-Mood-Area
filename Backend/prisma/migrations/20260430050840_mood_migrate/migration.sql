-- AlterTable
ALTER TABLE "MoodPin" ADD COLUMN     "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "DailyQuest" (
    "id" TEXT NOT NULL,
    "questType" VARCHAR(50) NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "targetMood" "Mood",
    "targetCount" INTEGER NOT NULL,
    "radiusMeters" INTEGER,
    "createdDate" DATE NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DailyQuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "QuestCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeighborhoodBattle" (
    "id" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "mood" "Mood" NOT NULL,
    "winnerNeighborhoodId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NeighborhoodBattle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleScore" (
    "id" TEXT NOT NULL,
    "battleId" TEXT NOT NULL,
    "neighborhoodId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "pinCount" INTEGER NOT NULL DEFAULT 0,
    "avgCredibility" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BattleScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodDiary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "weekEnd" DATE NOT NULL,
    "summaryData" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoodDiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpontaneousEvent" (
    "id" TEXT NOT NULL,
    "neighborhoodId" TEXT NOT NULL,
    "mood" "Mood" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pinCount" INTEGER NOT NULL,
    "circleId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SpontaneousEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VibeCheck" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "senderMood" "Mood",
    "receiverMood" "Mood",
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VibeCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "subscription" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyQuest_isActive_createdDate_idx" ON "DailyQuest"("isActive", "createdDate");

-- CreateIndex
CREATE UNIQUE INDEX "QuestCompletion_userId_questId_key" ON "QuestCompletion"("userId", "questId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestCompletion_sessionId_questId_key" ON "QuestCompletion"("sessionId", "questId");

-- CreateIndex
CREATE INDEX "NeighborhoodBattle_isActive_endDate_idx" ON "NeighborhoodBattle"("isActive", "endDate");

-- CreateIndex
CREATE INDEX "BattleScore_battleId_recordedAt_idx" ON "BattleScore"("battleId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MoodDiary_userId_weekStart_key" ON "MoodDiary"("userId", "weekStart");

-- CreateIndex
CREATE INDEX "SpontaneousEvent_neighborhoodId_isActive_idx" ON "SpontaneousEvent"("neighborhoodId", "isActive");

-- CreateIndex
CREATE INDEX "VibeCheck_receiverId_expiresAt_idx" ON "VibeCheck"("receiverId", "expiresAt");

-- CreateIndex
CREATE INDEX "PushSubscription_sessionId_idx" ON "PushSubscription"("sessionId");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- AddForeignKey
ALTER TABLE "QuestCompletion" ADD CONSTRAINT "QuestCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestCompletion" ADD CONSTRAINT "QuestCompletion_questId_fkey" FOREIGN KEY ("questId") REFERENCES "DailyQuest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NeighborhoodBattle" ADD CONSTRAINT "NeighborhoodBattle_winnerNeighborhoodId_fkey" FOREIGN KEY ("winnerNeighborhoodId") REFERENCES "Neighborhood"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleScore" ADD CONSTRAINT "BattleScore_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "NeighborhoodBattle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleScore" ADD CONSTRAINT "BattleScore_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhood"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodDiary" ADD CONSTRAINT "MoodDiary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpontaneousEvent" ADD CONSTRAINT "SpontaneousEvent_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhood"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpontaneousEvent" ADD CONSTRAINT "SpontaneousEvent_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "VibeCircle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VibeCheck" ADD CONSTRAINT "VibeCheck_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VibeCheck" ADD CONSTRAINT "VibeCheck_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
