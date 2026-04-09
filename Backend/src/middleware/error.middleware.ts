// server/src/middleware/error.middleware.ts
// Global Express error handler — must be registered last in index.ts.

import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export const errorMiddleware: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const appErr = err instanceof AppError ? err : null;
  const statusCode = appErr?.statusCode ?? 500;
  const message    = appErr?.isOperational === true ? appErr.message : 'Internal server error';

  if (appErr?.isOperational !== true) {
    logger.error('Unhandled error', { err, req: { method: req.method, url: req.url } });
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(env.NODE_ENV === 'development' && {
      stack: err instanceof Error ? err.stack : undefined,
    }),
  });
};
