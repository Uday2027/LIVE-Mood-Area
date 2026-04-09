// server/src/controllers/auth.controller.ts
// HTTP layer for auth — register, login, and profile endpoints.

import type { Request, Response } from 'express';
import * as AuthService from '../services/auth.service.js';
import { success, created } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import type { RegisterBody, LoginBody } from '../validators/auth.validator.js';

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body as RegisterBody);
  created(res, result);
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body as LoginBody);
  success(res, result);
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  if (req.user?.id === undefined) throw new AppError('Unauthorized', 401);
  const user = await AuthService.getProfile(req.user.id);
  success(res, user);
});

export const getMyPins = catchAsync(async (req: Request, res: Response) => {
  if (req.user?.id === undefined) throw new AppError('Unauthorized', 401);
  const { prisma } = await import('../config/database.js');

  const pins = await prisma.moodPin.findMany({
    where:   { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    select:  {
      id: true, mood: true, message: true,
      latitude: true, longitude: true,
      credibilityScore: true, expiresAt: true, createdAt: true,
      _count: { select: { votes: true } },
    },
  });

  success(res, pins);
});
