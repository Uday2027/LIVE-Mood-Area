import { Request, Response } from 'express';
import * as PushService from '../services/push.service.js';
import { success, created } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const subscribe = catchAsync(async (req: Request, res: Response) => {
  const sub = await PushService.subscribe(req.sessionId ?? '', req.user?.id, req.body);
  created(res, sub);
});
