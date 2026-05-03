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

const loaders: Record<string, RequestHandler> = {};

const isDev = env.NODE_ENV === 'development';

// In development, skip all rate limiting — React hot-reloads + React Query
// refetches will easily exceed any reasonable limit during local dev.
const passthrough: RequestHandler = (_req, _res, next) => next();

export const globalRateLimit = isDev
  ? passthrough
  : (req: Request, res: Response, next: NextFunction) => {
      loaders.global ??= rateLimit({
        windowMs:        env.RATE_LIMIT_WINDOW_MS,
        max:             env.RATE_LIMIT_MAX,
        store:           createStore('rl:global:'),
        standardHeaders: true,
        legacyHeaders:   false,
      });
      return loaders.global(req, res, next);
    };

export const pinRateLimit = isDev
  ? passthrough
  : (req: Request, res: Response, next: NextFunction) => {
      loaders.pin ??= rateLimit({
        windowMs: 3_600_000,
        max:      env.PIN_RATE_LIMIT_MAX,
        store:    createStore('rl:pin:'),
        keyGenerator: (r) => (r.headers['x-session-id'] as string | undefined) ?? r.ip ?? 'unknown',
      });
      return loaders.pin(req, res, next);
    };

export const voteRateLimit = isDev
  ? passthrough
  : (req: Request, res: Response, next: NextFunction) => {
      loaders.vote ??= rateLimit({
        windowMs: 3_600_000,
        max:      env.VOTE_RATE_LIMIT_MAX,
        store:    createStore('rl:vote:'),
        keyGenerator: (r) => (r.headers['x-session-id'] as string | undefined) ?? r.ip ?? 'unknown',
      });
      return loaders.vote(req, res, next);
    };

export const pingRateLimit = isDev
  ? passthrough
  : (req: Request, res: Response, next: NextFunction) => {
      loaders.ping ??= rateLimit({
        windowMs: 600_000,
        max:      5,
        store:    createStore('rl:ping:'),
        keyGenerator: (r) => (r.headers['x-session-id'] as string | undefined) ?? r.ip ?? 'unknown',
      });
      return loaders.ping(req, res, next);
    };
