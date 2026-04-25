import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { Mood } from '@prisma/client';

export const getActiveQuest = async () => {
  const quest = await prisma.dailyQuest.findFirst({
    where: { isActive: true },
    orderBy: { createdDate: 'desc' }
  });
  return quest;
};

export const checkQuestCompletion = async (questId: string, sessionId: string, userId?: string) => {
  const quest = await prisma.dailyQuest.findUnique({ where: { id: questId } });
  if (!quest || !quest.isActive) throw new AppError('Quest not found or inactive', 404);

  const completion = await prisma.questCompletion.findFirst({
    where: {
      questId,
      OR: [
        { sessionId },
        ...(userId ? [{ userId }] : [])
      ]
    }
  });

  return { isCompleted: !!completion, completion };
};
