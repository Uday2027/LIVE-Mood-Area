// server/src/utils/catchAsync.ts
// Wraps async Express handlers to forward thrown errors to errorMiddleware.

import type { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const catchAsync = (fn: AsyncHandler): RequestHandler =>
  (req, res, next): void => {
    fn(req, res, next).catch(next);
  };
