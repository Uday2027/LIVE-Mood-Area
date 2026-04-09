// server/src/middleware/auth.middleware.ts
// JWT verification — requireAuth for protected routes, optionalAuth for hybrid routes.

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import type { AuthUser } from '../types/express.js';

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token === undefined) {
    next(new AppError('Authentication required', 401));
    return;
  }

  try {
    req.user = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (typeof token === 'string') {
    try {
      req.user = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    } catch {
      // Token is optional — silently continue unauthenticated
    }
  }
  next();
};
