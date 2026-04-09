// server/src/utils/response.ts
// Standard response helpers — always use these in controllers, never res.json() directly.

import type { Response } from 'express';

export const success = (res: Response, data: unknown, statusCode = 200): void => {
  res.status(statusCode).json({ success: true, data });
};

export const created = (res: Response, data: unknown): void => {
  success(res, data, 201);
};

export const fail = (res: Response, message: string, statusCode = 400): void => {
  res.status(statusCode).json({ success: false, error: message });
};
