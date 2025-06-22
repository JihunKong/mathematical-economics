import Redis from 'ioredis';
import { logger } from '../utils/logger';

interface CacheConfig {
  stockPrice: number;      // 주식 가격 캐시 시간 (초)
  leaderboard: number;     // 리더보드 캐시 시간 (초)
  portfolio: number;       // 포트폴리오 캐시 시간 (초)
  staticData: number;      // 정적 데이터 캐시 시간 (초)
  userSession: number;     // 사용자 세션 캐시 시간 (초)
}

interface CacheStats {
  hits: number;
  misses: number;
  errors: number;
  lastReset: Date;
}

export class ImprovedCacheService {
  private redis: Redis | null = null;
  private memoryCache: Map<string, { value: any; expires: number }> = new Map();
  private cacheConfig: CacheConfig;
  private stats: CacheStats;
  private isConnected: boolean = false;

  constructor() {
    this.cacheConfig = {
      stockPrice: 60,        // 1분
      leaderboard: 300,      // 5분
      portfolio: 120,        // 2분
      staticData: 3600,      // 1시간
      userSession: 1800,     // 30분
    };

    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0,
      lastReset: new Date(),
    };

    this.initializeRedis();
  }

  private async initializeRedis() {
    if (!process.env.REDIS_URL) {
      logger.warn('Redis URL not configured, using memory cache only');
      return;
    }

    try {
      this.redis = new Redis(process.env.REDIS_URL, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        reconnectOnError: (err) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        },
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      this.redis.on('connect', () => {
        logger.info('Redis connected successfully');
        this.isConnected = true;
      });

      this.redis.on('error', (error) => {
        logger.error('Redis error:', error);
        this.isConnected = false;
        this.stats.errors++;
      });

      this.redis.on('close', () => {
        logger.warn('Redis connection closed');
        this.isConnected = false;
      });

      await this.redis.connect();
    } catch (error) {
      logger.error('Failed to initialize Redis:', error);
      this.redis = null;
    }
  }

  // 캐시 키 생성 헬퍼
  private generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  // 주식 가격 캐싱
  async getStockPrice(symbol: string): Promise<any | null> {
    const key = this.generateKey('stock', 'price', symbol);
    return this.get(key, this.cacheConfig.stockPrice);
  }

  async setStockPrice(symbol: string, data: any): Promise<void> {
    const key = this.generateKey('stock', 'price', symbol);
    await this.set(key, data, this.cacheConfig.stockPrice);
  }

  // 리더보드 캐싱
  async getLeaderboard(type: string, classId?: string): Promise<any | null> {
    const key = classId 
      ? this.generateKey('leaderboard', type, classId)
      : this.generateKey('leaderboard', type, 'all');
    return this.get(key, this.cacheConfig.leaderboard);
  }

  async setLeaderboard(type: string, data: any, classId?: string): Promise<void> {
    const key = classId 
      ? this.generateKey('leaderboard', type, classId)
      : this.generateKey('leaderboard', type, 'all');
    await this.set(key, data, this.cacheConfig.leaderboard);
  }

  // 포트폴리오 캐싱
  async getPortfolio(userId: string): Promise<any | null> {
    const key = this.generateKey('portfolio', userId);
    return this.get(key, this.cacheConfig.portfolio);
  }

  async setPortfolio(userId: string, data: any): Promise<void> {
    const key = this.generateKey('portfolio', userId);
    await this.set(key, data, this.cacheConfig.portfolio);
  }

  async invalidatePortfolio(userId: string): Promise<void> {
    const key = this.generateKey('portfolio', userId);
    await this.delete(key);
  }

  // 일반 캐시 메서드
  async get(key: string, ttl?: number): Promise<any | null> {
    try {
      // Redis 시도
      if (this.redis && this.isConnected) {
        const value = await this.redis.get(key);
        if (value) {
          this.stats.hits++;
          return JSON.parse(value);
        }
      }

      // 메모리 캐시 확인
      const cached = this.memoryCache.get(key);
      if (cached && cached.expires > Date.now()) {
        this.stats.hits++;
        return cached.value;
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      logger.error('Cache get error:', error);
      this.stats.errors++;
      return null;
    }
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);

      // Redis에 저장
      if (this.redis && this.isConnected) {
        await this.redis.setex(key, ttl, serialized);
      }

      // 메모리 캐시에도 저장
      this.memoryCache.set(key, {
        value,
        expires: Date.now() + (ttl * 1000),
      });

      // 메모리 캐시 크기 제한
      if (this.memoryCache.size > 1000) {
        this.cleanupMemoryCache();
      }
    } catch (error) {
      logger.error('Cache set error:', error);
      this.stats.errors++;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (this.redis && this.isConnected) {
        await this.redis.del(key);
      }
      this.memoryCache.delete(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      if (this.redis && this.isConnected) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }

      // 메모리 캐시에서도 삭제
      for (const key of this.memoryCache.keys()) {
        if (this.matchPattern(key, pattern)) {
          this.memoryCache.delete(key);
        }
      }
    } catch (error) {
      logger.error('Cache delete pattern error:', error);
    }
  }

  private matchPattern(key: string, pattern: string): boolean {
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${regexPattern}$`).test(key);
  }

  private cleanupMemoryCache(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, cached] of this.memoryCache.entries()) {
      if (cached.expires < now) {
        this.memoryCache.delete(key);
        removed++;
      }
    }

    // 그래도 너무 많으면 오래된 것부터 삭제
    if (this.memoryCache.size > 800) {
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].expires - b[1].expires);
      
      const toRemove = entries.slice(0, 200);
      for (const [key] of toRemove) {
        this.memoryCache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      logger.info(`Cleaned up ${removed} expired cache entries`);
    }
  }

  // 캐시 통계
  getStats(): CacheStats & { memorySize: number; redisConnected: boolean } {
    return {
      ...this.stats,
      memorySize: this.memoryCache.size,
      redisConnected: this.isConnected,
    };
  }

  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0,
      lastReset: new Date(),
    };
  }

  // 전체 캐시 클리어 (주의해서 사용)
  async flush(): Promise<void> {
    try {
      if (this.redis && this.isConnected) {
        await this.redis.flushdb();
      }
      this.memoryCache.clear();
      logger.info('Cache flushed');
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