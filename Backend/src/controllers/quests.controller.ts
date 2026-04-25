import { Request, Response } from 'express';
import * as QuestService from '../services/quest.service.js';
import { success } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getActiveQuest = catchAsync(async (req: Request, res: Response) => {
  const quest = await QuestService.getActiveQuest();
  success(res, quest);
});

export const checkQuestCompletion = catchAsync(async (req: Request, res: Response) => {
  const result = await QuestService.checkQuestCompletion(String(req.params['id']), req.sessionId ?? '', req.user?.id);
  success(res, result);
});
