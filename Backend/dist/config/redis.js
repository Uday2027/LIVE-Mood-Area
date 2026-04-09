// server/src/config/redis.ts
// Redis client singleton — used for rate limiting and socket state.
import { createClient } from 'redis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
export const redisClient = createClient({
    url: env.REDIS_URL,
});
redisClient.on('error', (err) => {
    logger.error('Redis connection error', { err });
});
redisClient.on('connect', () => {
    logger.info('Redis connected');
});
export const connectRedis = async () => {
    await redisClient.connect();
};
//# sourceMappingURL=redis.js.map