import Redis from 'ioredis';
import { logger } from '../utils/logger';

// Parse Redis URL if provided, otherwise use host/port
let redis: Redis;

if (process.env.REDIS_URL) {
  // If REDIS_URL is provided (e.g., redis://redis:6379), use it directly
  redis = new Redis(process.env.REDIS_URL, {
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: false
  });
} else {
  // Otherwise, use host/port configuration
  const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: false
  };
  redis = new Redis(redisConfig);
}

export { redis };

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (error: Error) => {
  logger.error('Redis connection error:', error);
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await redis.quit();
  logger.info('Redis connection closed gracefully');
});