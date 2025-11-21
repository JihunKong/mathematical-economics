import Redis from 'ioredis';
import { logger } from '../utils/logger'에러가 발생했습니다'Redis URL not configured, using memory cache only'에러가 발생했습니다'READONLY'에러가 발생했습니다'connect', () => {
        logger.info('Redis connected successfully');
        this.isConnected = true;
      });

      this.redis.on('error', (error) => {
        logger.error('Redis error:'에러가 발생했습니다'close', () => {
        logger.warn('Redis connection closed'에러가 발생했습니다'Failed to initialize Redis:'에러가 발생했습니다':'에러가 발생했습니다'stock', 'price'에러가 발생했습니다'stock', 'price'에러가 발생했습니다'leaderboard', type, classId)
      : this.generateKey('leaderboard', type, 'all'에러가 발생했습니다'leaderboard', type, classId)
      : this.generateKey('leaderboard', type, 'all'에러가 발생했습니다'portfolio'에러가 발생했습니다'portfolio'에러가 발생했습니다'portfolio'에러가 발생했습니다'Cache get error:'에러가 발생했습니다'Cache set error:'에러가 발생했습니다'Cache delete error:'에러가 발생했습니다'Cache delete pattern error:'에러가 발생했습니다'.*')
      .replace(/\?/g, '.'에러가 발생했습니다'Cache flushed');
    } catch (error) {
      logger.error('Cache flush error:', error);
    }
  }

  // 연결 종료
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
    this.memoryCache.clear();
  }
}

// 싱글톤 인스턴스
export const cacheService = new ImprovedCacheService();