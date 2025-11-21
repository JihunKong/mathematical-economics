import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '500'), // Limit each IP to 500 requests per windowMs (100 → 500)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    });
  }
});

// Rate limiter for auth endpoints - 크롤러와 분리
export const authRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // IP당 5분에 100번 (50 → 100)
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // 성공한 요청은 카운트하지 않음
  skip: (req) => {
    // 로컬호스트나 내부 크롤러는 제외
    const ip = req.ip || req.connection.remoteAddress;
    return ip === '127.0.0.1' || ip === '::1' || ip?.includes('127.0.0.1');
  }
});

// 주식 관련 엔드포인트를 위한 더 관대한 rate limiter
export const stockRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  max: 500, // Limit each IP to 500 requests per minute (200 → 500)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: (req: Request) => {
    // Skip rate limiting for batch endpoints
    if (req.path.includes('/prices/multiple') || req.path.includes('/update-all-prices')) {
      return true;
    }
    return false;
  }
});

// 거래 관련 엔드포인트를 위한 rate limiter
export const tradingRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 trades per minute (30 → 60)
  message: 'Too many trading requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false
});