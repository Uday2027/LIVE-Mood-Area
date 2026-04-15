// server/src/services/quest.service.ts
// Logic for daily quests — fetching current quest and tracking progress.

import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import type { Mood } from '@prisma/client';

export const getActiveQuest = async () => {
  const quest = await prisma.dailyQuest.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  if (!quest) throw new AppError('No active quest found', 404);
  return quest;
};

export const checkQuestCompletion = async (
  sessionId: string,
  userId?: string
) => {
  const quest = await getActiveQuest();
  
  // Check if already completed
  const existing = await prisma.questCompletion.findUnique({
    where: { questId_sessionId: { questId: quest.id, sessionId } },
  });
  if (existing) return { completed: true, quest };

  // For this simple logic, completing a quest might be: 
  // "Drop 1 pin of type X" or "Earn 3 confirm votes".
  // This logic should be called after a relevant action (like createPin).
  
  // Example condition: User dropped a pin with the required mood today.
  if (quest.moodType) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pin = await prisma.moodPin.findFirst({
      where: {
        sessionId,
        mood: quest.moodType,
        createdAt: { gte: today },
      },
    });

    if (pin) {
      const completion = await prisma.questCompletion.create({
        data: { questId: quest.id, sessionId, userId },
      });
      return { completed: true, quest, completion };
    }
  }

  return { completed: false, quest };
};

export const createDailyQuest = async (data: {
  title: string;
  description: string;
  moodType: Mood;
}) => {
  // Deactivate old quests
  await prisma.dailyQuest.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  return prisma.dailyQuest.create({
    data: { ...data, isActive: true },
  });
};
