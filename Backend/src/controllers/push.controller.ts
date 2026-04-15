// server/src/controllers/push.controller.ts
// HTTP layer for push subscription management.

import type { Request, Response } from 'express';
import * as PushService from '../services/push.service.js';
import { success } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const subscribe = catchAsync(async (req: Request, res: Response) => {
  await PushService.subscribe(
    req.sessionId,
    req.body.subscription,
    req.user?.id
  );
  success(res, { message: 'Subscribed to push notifications' });
});
