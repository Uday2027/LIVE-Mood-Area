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
  const rawMessage = appErr?.isOperational === true ? appErr.message : 'Internal server error';

  if (appErr?.isOperational !== true) {
    logger.error('Unhandled error', { err, req: { method: req.method, url: req.url } });
  }

  // Try to parse structured error payloads (e.g. 409 collision with collidedPin)
  try {
    const parsed = JSON.parse(rawMessage) as Record<string, unknown>;
    res.status(statusCode).json({
      success: false,
      error: parsed,
      ...(env.NODE_ENV === 'development' && {
        stack: err instanceof Error ? err.stack : undefined,
      }),
    });
    return;
  } catch {
    // Not JSON — emit as plain string error
  }

  res.status(statusCode).json({
    success: false,
    error: rawMessage,
    ...(env.NODE_ENV === 'development' && {
      stack: err instanceof Error ? err.stack : undefined,
    }),
  });
};
