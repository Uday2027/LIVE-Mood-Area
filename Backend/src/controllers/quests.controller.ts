// server/src/controllers/quests.controller.ts
import type { Request, Response } from 'express';
import * as QuestService from '../services/quest.service.js';
import { success } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getTodayQuest = catchAsync(async (_req: Request, res: Response) => {
  const quest = await QuestService.getActiveQuest();
  success(res, quest);
});

export const checkProgress = catchAsync(async (req: Request, res: Response) => {
  const result = await QuestService.checkQuestCompletion(
    req.sessionId,
    req.user?.id
  );
  success(res, result);
});
