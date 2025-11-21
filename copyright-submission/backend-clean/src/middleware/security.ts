import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { logger } from '../utils/logger'에러가 발생했습니다'security_limiter'에러가 발생했습니다'strict_limiter'에러가 발생했습니다'x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection.remoteAddress || 'unknown'에러가 발생했습니다'user-agent') || ''에러가 발생했습니다'Suspicious pattern detected'에러가 발생했습니다'Suspicious user-agent detected'에러가 발생했습니다'Blocked IP attempted access', { ip: clientIp });
      res.status(403).json({ 
        success: false, 
        message: 'Access denied'에러가 발생했습니다'Access denied'에러가 발생했습니다'1'); // 24시간 차단
      }
      
      logger.error('Suspicious activity detected, IP blocked'에러가 발생했습니다'user-agent'),
      });
      
      res.status(403).json({ 
        success: false, 
        message: '\uad8c\ud55c\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.'에러가 발생했습니다'Rate limit exceeded'에러가 발생했습니다'Too many requests'에러가 발생했습니다'unknown'에러가 발생했습니다'Login rate limit exceeded'에러가 발생했습니다'Too many login attempts. Please try again later.'에러가 발생했습니다'X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HSTS (HTTPS인 경우에만)
  if (req.secure) {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'에러가 발생했습니다'IP unblocked'에러가 발생했습니다'blocked:*');
    const redisBlocked = keys.map(key => key.replace('blocked:', ''));
    return [...new Set([...localBlocked, ...redisBlocked])];
  }
  
  return localBlocked;
}