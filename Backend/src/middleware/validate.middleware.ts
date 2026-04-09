// server/src/middleware/validate.middleware.ts
// Zod request validation middleware factory.

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { z } from 'zod';
import { AppError } from '../utils/AppError.js';

type RequestShape = {
  body?:   ZodTypeAny;
  params?: ZodTypeAny;
  query?:  ZodTypeAny;
};

export const validate = (schema: z.ZodObject<RequestShape>): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body:   req.body,
      params: req.params,
      query:  req.query,
    });

    if (!result.success) {
      const message = result.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      next(new AppError(message, 422));
      return;
    }

    if (result.data.body   !== undefined) req.body   = result.data.body;
    if (result.data.params !== undefined) req.params = result.data.params as Record<string, string>;
    if (result.data.query  !== undefined) req.query  = result.data.query  as Record<string, string>;

    next();
  };
