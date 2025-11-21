import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'에러가 발생했습니다'Too many requests from this IP, please try again later.'에러가 발생했습니다'Too many authentication attempts, please try again later.'에러가 발생했습니다'127.0.0.1' || ip === '::1' || ip?.includes('127.0.0.1'에러가 발생했습니다'60000'), // 1 minute
  max: 200, // Limit each IP to 200 requests per minute
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don'에러가 발생했습니다'/prices/multiple') || req.path.includes('/update-all-prices'에러가 발생했습니다'Too many trading requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false
});