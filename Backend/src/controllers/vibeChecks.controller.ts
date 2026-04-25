import { Request, Response } from 'express';
import * as VibeCheckService from '../services/vibeCheck.service.js';
import { success, created } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const sendVibeCheck = catchAsync(async (req: Request, res: Response) => {
  const { receiverId } = req.body;
  const check = await VibeCheckService.sendVibeCheck(req.user!.id, receiverId);
  created(res, check);
});

export const respondVibeCheck = catchAsync(async (req: Request, res: Response) => {
  const { mood } = req.body;
  const check = await VibeCheckService.respondVibeCheck(String(req.params['id']), req.user!.id, mood);
  success(res, check);
});

export const getPendingChecks = catchAsync(async (req: Request, res: Response) => {
  const checks = await VibeCheckService.getPendingChecks(req.user!.id);
  success(res, checks);
});
