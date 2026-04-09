// server/src/middleware/rateLimit.middleware.ts
// Express rate limiting backed by Redis — never use in-memory store in production.

import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '../config/redis.js';
import { env } from '../config/env.js';

import type { Request, Response, NextFunction, RequestHandler } from 'express';

const createStore = (prefix: string) =>
  new RedisStore({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendCommand: (...args: string[]): Promise<any> => redisClient.sendCommand(args),
    prefix,
  });

let loaders: Record<string, RequestHandler> = {};

export const globalRateLimit = (req: Request, res: Response, next: NextFunction) => {
  loaders.global ??= rateLimit({
    windowMs:       env.RATE_LIMIT_WINDOW_MS,
    max:            env.RATE_LIMIT_MAX,
    store:          createStore('rl:global:'),
    standardHeaders: true,
    legacyHeaders:   false,
  });
  return loaders.global(req, res, next);
};

export const pinRateLimit = (req: Request, res: Response, next: NextFunction) => {
  loaders.pin ??= rateLimit({
    windowMs: 3_600_000,
    max:      env.PIN_RATE_LIMIT_MAX,
    store:    createStore('rl:pin:'),
    keyGenerator: (r) => (r.headers['x-session-id'] as string | undefined) ?? r.ip ?? 'unknown',
  });
  return loaders.pin(req, res, next);
};

export const voteRateLimit = (req: Request, res: Response, next: NextFunction) => {
  loaders.vote ??= rateLimit({
    windowMs: 3_600_000,
    max:      env.VOTE_RATE_LIMIT_MAX,
    store:    createStore('rl:vote:'),
    keyGenerator: (r) => (r.headers['x-session-id'] as string | undefined) ?? r.ip ?? 'unknown',
  });
  return loaders.vote(req, res, next);
};
