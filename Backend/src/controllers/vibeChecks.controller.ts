// server/src/controllers/vibeChecks.controller.ts
import type { Request, Response } from 'express';
import * as VibeCheckService from '../services/vibeCheck.service.js';
import { success, created } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const sendCheck = catchAsync(async (req: Request, res: Response) => {
  const check = await VibeCheckService.sendVibeCheck({
    senderId:   req.user!.id,
    receiverId: req.body.receiverId,
    senderMood: req.body.senderMood,
  });
  created(res, check);
});

export const respond = catchAsync(async (req: Request, res: Response) => {
  const result = await VibeCheckService.respondToVibeCheck(
    req.params['id'] as string,
    req.user!.id,
    req.body.mood,
    req.body.status
  );
  success(res, result);
});

export const getPending = catchAsync(async (req: Request, res: Response) => {
  const checks = await VibeCheckService.getPendingChecks(req.user!.id);
  success(res, checks);
});
