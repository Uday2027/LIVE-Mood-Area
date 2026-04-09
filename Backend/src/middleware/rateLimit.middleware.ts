// server/src/middleware/rateLimit.middleware.ts
// Express rate limiting backed by Redis — never use in-memory store in production.

import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '../config/redis.js';
import { env } from '../config/env.js';

const store = new RedisStore({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendCommand: (...args: string[]): Promise<any> => redisClient.sendCommand(args),
});

export const globalRateLimit = rateLimit({
  windowMs:       env.RATE_LIMIT_WINDOW_MS,
  max:            env.RATE_LIMIT_MAX,
  store,
  standardHeaders: true,
  legacyHeaders:   false,
});

export const pinRateLimit = rateLimit({
  windowMs: 3_600_000,
  max:      env.PIN_RATE_LIMIT_MAX,
  store,
  keyGenerator: (req) =>
    (req.headers['x-session-id'] as string | undefined) ?? req.ip ?? 'unknown',
});

export const voteRateLimit = rateLimit({
  windowMs: 3_600_000,
  max:      env.VOTE_RATE_LIMIT_MAX,
  store,
  keyGenerator: (req) =>
    (req.headers['x-session-id'] as string | undefined) ?? req.ip ?? 'unknown',
});
