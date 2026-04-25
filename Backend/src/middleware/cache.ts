import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';

export const cache = (ttlSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `moodmap:cache:${req.originalUrl}`;
    try {
      if (redisClient.isOpen) {
        const cachedResponse = await redisClient.get(key);
        if (cachedResponse) {
          res.setHeader('X-Cache', 'HIT');
          return res.json(JSON.parse(cachedResponse));
        }
      }

      res.setHeader('X-Cache', 'MISS');

      // Intercept res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        if (redisClient.isOpen) {
          redisClient.setEx(key, ttlSeconds, JSON.stringify(body)).catch((err: any) => {
            logger.error('Failed to cache response', { err, key });
          });
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error', { error });
      next();
    }
  };
};
