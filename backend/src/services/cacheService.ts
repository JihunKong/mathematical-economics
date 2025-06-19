import { logger } from '../utils/logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  // Set a value in cache with TTL (in milliseconds)
  set<T>(key: string, value: T, ttl: number = 60000): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl
    });
  }

  // Get a value from cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Check if a key exists and is not expired
  has(key: string): boolean {
    const value = this.get(key);
    return value !== null;
  }

  // Delete a specific key
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`Cache cleanup: removed ${cleaned} expired entries`);
    }
  }

  // Get cache statistics
  getStats(): {
    size: number;
    keys: string[];
    memoryUsage: number;
  } {
    const keys = Array.from(this.cache.keys());
    const memoryUsage = this.estimateMemoryUsage();

    return {
      size: this.cache.size,
      keys,
      memoryUsage
    };
  }

  // Estimate memory usage (rough estimate)
  private estimateMemoryUsage(): number {
    let totalSize = 0;

    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length * 2; // Unicode characters
      totalSize += JSON.stringify(entry.data).length * 2;
      totalSize += 16; // Overhead for timestamp and ttl
    }

    return totalSize;
  }

  // Decorator for caching function results
  static cacheable<T extends (...args: any[]) => Promise<any>>(
    keyGenerator: (...args: Parameters<T>) => string,
    ttl: number = 60000
  ) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: Parameters<T>) {
        const cacheKey = keyGenerator(...args);
        const cached = cacheService.get(cacheKey);

        if (cached !== null) {
          logger.debug(`Cache hit for ${propertyKey}: ${cacheKey}`);
          return cached;
        }

        logger.debug(`Cache miss for ${propertyKey}: ${cacheKey}`);
        const result = await originalMethod.apply(this, args);
        
        if (result !== null && result !== undefined) {
          cacheService.set(cacheKey, result, ttl);
        }

        return result;
      };

      return descriptor;
    };
  }

  // Stop the cleanup interval
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Export a singleton instance
export const cacheService = new CacheService();

// Cache TTL constants
export const CACHE_TTL = {
  STOCK_PRICE: 30 * 1000,        // 30 seconds
  STOCK_LIST: 5 * 60 * 1000,     // 5 minutes
  STOCK_CHART: 10 * 60 * 1000,   // 10 minutes
  STOCK_NEWS: 30 * 60 * 1000,    // 30 minutes
  USER_DATA: 60 * 1000,          // 1 minute
  PORTFOLIO: 30 * 1000,          // 30 seconds
  LEADERBOARD: 5 * 60 * 1000,    // 5 minutes
};

// Cache key generators
export const cacheKeys = {
  stockPrice: (symbol: string) => `stock:price:${symbol}`,
  stockList: (market?: string) => `stock:list:${market || 'all'}`,
  stockChart: (symbol: string, period: string) => `stock:chart:${symbol}:${period}`,
  stockNews: (symbol: string) => `stock:news:${symbol}`,
  portfolio: (userId: string) => `portfolio:${userId}`,
  holdings: (userId: string) => `holdings:${userId}`,
  leaderboard: (timeRange: string) => `leaderboard:${timeRange}`,
};