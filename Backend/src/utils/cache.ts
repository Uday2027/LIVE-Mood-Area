// server/src/utils/cache.js
// Redis caching utility — handles get/set with TTL and invalidation.

import { redisClient } from '../config/redis.js';
import { logger } from './logger.js';

/**
 * Wraps a service function with Redis caching.
 */
export const withCache = async <T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> => {
  try {
    const cached = await redisClient.get(key);
    if (cached) {
      logger.debug(`Cache hit: ${key}`);
      return JSON.parse(cached);
    }
  } catch (err) {
    logger.error('Redis cache get error', { err, key });
  }

  const result = await fn();

  try {
    await redisClient.setex(key, ttl, JSON.stringify(result));
    logger.debug(`Cache miss/set: ${key}`);
  } catch (err) {
    logger.error('Redis cache set error', { err, key });
  }

  return result;
};

/**
 * Invalidate a cache key.
 */
export const invalidateCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
    logger.debug(`Cache invalidation: ${key}`);
  } catch (err) {
    logger.error('Redis cache del error', { err, key });
  }
};
