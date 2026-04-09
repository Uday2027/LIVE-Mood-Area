// server/src/config/redis.ts
// Redis client singleton — used for rate limiting and socket state.

import { createClient, type RedisClientType } from 'redis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export const redisClient: RedisClientType = createClient({
  url: env.REDIS_URL,
}) as RedisClientType;

redisClient.on('error', (err: Error) => {
  logger.error('Redis connection error', { err });
});

redisClient.on('connect', () => {
  logger.info('Redis connected');
});

export const connectRedis = async (): Promise<void> => {
  await redisClient.connect();
};
