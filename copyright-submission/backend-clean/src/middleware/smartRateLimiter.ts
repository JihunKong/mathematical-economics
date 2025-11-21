import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { logger } from '../utils/logger'에러가 발생했습니다'unknown';
    
    // Determine which rate limiter to use
    let limiterType: keyof typeof rateLimiters = 'standard';
    
    if (path.includes('/auth/')) {
      limiterType = 'auth';
    } else if (path.includes('/trading/')) {
      limiterType = 'trading';
    } else if (path.includes('/prices/multiple') || path.includes('/batch')) {
      limiterType = 'batch';
    } else if (path.includes('/price') || path.includes('/real-stocks/') || path.includes('/stocks/')) {
      limiterType = 'stockPrice'에러가 발생했습니다'Rate limit exceeded'에러가 발생했습니다'Too many requests. Please try again later.'에러가 발생했습니다'finish', () => {
    const duration = Date.now() - startTime;
    const userAgent = req.get('user-agent') || 'unknown';
    
    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow API request'에러가 발생했습니다'/price') && duration < 100) {
      logger.info('Fast price request', {
        path: req.path,
        duration,
        cached: res.getHeader('X-Cache-Hit') === 'true',
      });
    }
  });
  
  next();
};

// Helper to create endpoint-specific rate limiters
export const createEndpointLimiter = (points: number, duration: number) => {
  return new RateLimiterMemory({
    points,
    duration,
    blockDuration: Math.min(duration, 60),
  });
};