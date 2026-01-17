import Redis from 'ioredis';
import { logger } from '../utils/logger';

// Parse Redis URL if provided, otherwise use host/port
let redis: Redis | null = null;
let redisEnabled = false;

function createRedisConnection(): Redis | null {
  // Skip Redis if explicitly disabled or no URL provided
  if (process.env.REDIS_ENABLED === 'false') {
    logger.info('Redis is disabled via REDIS_ENABLED=false');
    return null;
  }

  // In production without REDIS_URL, skip Redis
  if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
    logger.info('Redis skipped: No REDIS_URL in production');
    return null;
  }

  try {
    let client: Redis;

    if (process.env.REDIS_URL) {
      client = new Redis(process.env.REDIS_URL, {
        retryStrategy: (times: number) => {
          if (times > 3) {
            logger.warn('Redis connection failed, continuing without Redis');
            return null; // Stop retrying
          }
          return Math.min(times * 100, 2000);
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        enableOfflineQueue: false,
        lazyConnect: true
      });
    } else {
      client = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        retryStrategy: (times: number) => {
          if (times > 3) {
            logger.warn('Redis connection failed, continuing without Redis');
            return null;
          }
          return Math.min(times * 100, 2000);
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        enableOfflineQueue: false,
        lazyConnect: true
      });
    }

    client.on('connect', () => {
      redisEnabled = true;
      logger.info('Redis connected successfully');
    });

    client.on('error', (error: Error) => {
      logger.warn('Redis connection error (non-fatal):', error.message);
      redisEnabled = false;
    });

    client.on('close', () => {
      logger.info('Redis connection closed');
      redisEnabled = false;
    });

    return client;
  } catch (error) {
    logger.warn('Failed to create Redis connection:', error);
    return null;
  }
}

redis = createRedisConnection();

// Helper to check if Redis is available
export function isRedisAvailable(): boolean {
  return redisEnabled && redis !== null;
}

// Safe Redis getter that returns null if unavailable
export function getRedis(): Redis | null {
  return isRedisAvailable() ? redis : null;
}

export { redis };

// Graceful shutdown
process.on('SIGINT', async () => {
  if (redis) {
    await redis.quit();
    logger.info('Redis connection closed gracefully');
  }
});