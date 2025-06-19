import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { logger } from '../utils/logger';

// Different rate limiters for different endpoint types
const rateLimiters = {
  // Standard API endpoints
  standard: new RateLimiterMemory({
    points: 100, // Number of requests
    duration: 60, // Per 60 seconds
    blockDuration: 10, // Block for 10 seconds if exceeded
  }),
  
  // Stock price endpoints - more lenient
  stockPrice: new RateLimiterMemory({
    points: 200,
    duration: 60,
    blockDuration: 5,
  }),
  
  // Batch endpoints - very lenient
  batch: new RateLimiterMemory({
    points: 50,
    duration: 60,
    blockDuration: 5,
  }),
  
  // Trading endpoints - stricter
  trading: new RateLimiterMemory({
    points: 30,
    duration: 60,
    blockDuration: 30,
  }),
  
  // Auth endpoints - very strict
  auth: new RateLimiterMemory({
    points: 5,
    duration: 900, // 15 minutes
    blockDuration: 900,
  }),
};

// Smart rate limiter that chooses the appropriate limiter based on the endpoint
export const smartRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const path = req.path;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    // Determine which rate limiter to use
    let limiterType: keyof typeof rateLimiters = 'standard';
    
    if (path.includes('/auth/')) {
      limiterType = 'auth';
    } else if (path.includes('/trading/')) {
      limiterType = 'trading';
    } else if (path.includes('/prices/multiple') || path.includes('/batch')) {
      limiterType = 'batch';
    } else if (path.includes('/price') || path.includes('/real-stocks/') || path.includes('/stocks/')) {
      limiterType = 'stockPrice';
    }
    
    const rateLimiter = rateLimiters[limiterType];
    
    // Special handling for authenticated users
    const userId = req.user?.id;
    const key = userId ? `user_${userId}` : `ip_${ip}`;
    
    // Give authenticated users more points
    const pointsToConsume = userId ? 1 : 2;
    
    await rateLimiter.consume(key, pointsToConsume);
    
    next();
  } catch (rejRes: any) {
    // Log rate limit violations
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userId: req.user?.id,
      remainingPoints: rejRes.remainingPoints || 0,
      msBeforeNext: rejRes.msBeforeNext || 0,
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 60,
    });
  }
};

// Middleware to track API usage patterns
export const apiUsageTracker = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const userAgent = req.get('user-agent') || 'unknown';
    
    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow API request', {
        path: req.path,
        method: req.method,
        duration,
        userId: req.user?.id,
        userAgent,
      });
    }
    
    // Log high frequency endpoints
    if (req.path.includes('/price') && duration < 100) {
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