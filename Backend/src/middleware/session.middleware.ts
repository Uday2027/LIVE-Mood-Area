// server/src/middleware/session.middleware.ts
// Validates and injects req.sessionId from the x-session-id header.

import type { Request, Response, NextFunction } from 'express';
import { validate as isUuid } from 'uuid';
import { AppError } from '../utils/AppError.js';

export const sessionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const sessionId = req.headers['x-session-id'];

  if (typeof sessionId === 'string' && !isUuid(sessionId)) {
    next(new AppError('Invalid x-session-id header: must be a valid UUID v4', 400));
    return;
  }

  req.sessionId = typeof sessionId === 'string' ? sessionId : null;
  next();
};
