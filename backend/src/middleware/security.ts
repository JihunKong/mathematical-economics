import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { logger } from '../utils/logger';

// 의심스러운 패턴 목록
const SUSPICIOUS_PATTERNS = [
  /\.\./g,  // Directory traversal
  /<script/gi,  // XSS attempts
  /union.*select/gi,  // SQL injection
  /eval\(/gi,  // Code injection
  /base64_decode/gi,  // Encoded payloads
  /phpinfo/gi,  // PHP probing
  /\/etc\/passwd/g,  // System file access
  /\.env/g,  // Environment file access
  /wp-admin/gi,  // WordPress scanning
  /phpmyadmin/gi,  // Database admin scanning
];

// 의심스러운 User-Agent 목록
const SUSPICIOUS_USER_AGENTS = [
  /nikto/i,
  /sqlmap/i,
  /acunetix/i,
  /nessus/i,
  /metasploit/i,
  /burp/i,
  /dirbuster/i,
  /nmap/i,
];

// 차단된 IP 저장소 (실제 환경에서는 Redis 사용)
const blockedIPs = new Set<string>();

// Redis 클라이언트 생성 (사용 가능한 경우)
let redis: Redis | null = null;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
}

// Rate limiter 설정
const rateLimiter = redis
  ? new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: 'security_limiter',
      points: 1800, // 요청 수 (300 → 1800 = 30 req/sec)
      duration: 60, // 60초
      blockDuration: 300, // 5분 차단
    })
  : new RateLimiterMemory({
      points: 1800,
      duration: 60,
      blockDuration: 300,
    });

// 엄격한 rate limiter (로그인 시도 등)
const strictRateLimiter = redis
  ? new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: 'strict_limiter',
      points: 20, // 5 → 20
      duration: 900, // 15분
      blockDuration: 1800, // 30분 차단 (1시간 → 30분)
    })
  : new RateLimiterMemory({
      points: 20,
      duration: 900,
      blockDuration: 1800,
    });

// IP 추출 함수
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection.remoteAddress || 'unknown';
}

// 의심스러운 요청 감지
export function detectSuspiciousActivity(req: Request): boolean {
  const url = req.url;
  const body = JSON.stringify(req.body);
  const userAgent = req.get('user-agent') || '';
  
  // URL 패턴 검사
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(url) || pattern.test(body)) {
      logger.warn('Suspicious pattern detected', {
        ip: getClientIp(req),
        pattern: pattern.toString(),
        url,
        userAgent,
      });
      return true;
    }
  }
  
  // User-Agent 검사
  for (const pattern of SUSPICIOUS_USER_AGENTS) {
    if (pattern.test(userAgent)) {
      logger.warn('Suspicious user-agent detected', {
        ip: getClientIp(req),
        userAgent,
      });
      return true;
    }
  }
  
  return false;
}

// 보안 미들웨어
export async function securityMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const clientIp = getClientIp(req);

  // Skip rate limiting for localhost/internal requests
  if (clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === 'localhost' || clientIp?.includes('127.0.0.1')) {
    next();
    return;
  }

  try {
    // 차단된 IP 확인
    if (blockedIPs.has(clientIp)) {
      logger.warn('Blocked IP attempted access', { ip: clientIp });
      res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
      return;
    }
    
    // Redis에서 차단된 IP 확인
    if (redis) {
      const isBlocked = await redis.get(`blocked:${clientIp}`);
      if (isBlocked) {
        res.status(403).json({ 
          success: false, 
          message: 'Access denied' 
        });
        return;
      }
    }
    
    // 의심스러운 활동 감지
    if (detectSuspiciousActivity(req)) {
      // IP 차단
      blockedIPs.add(clientIp);
      if (redis) {
        await redis.setex(`blocked:${clientIp}`, 86400, '1'); // 24시간 차단
      }
      
      logger.error('Suspicious activity detected, IP blocked', {
        ip: clientIp,
        method: req.method,
        url: req.url,
        userAgent: req.get('user-agent'),
      });
      
      res.status(403).json({ 
        success: false, 
        message: '\uad8c\ud55c\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.' 
      });
      return;
    }
    
    // Rate limiting 적용
    await rateLimiter.consume(clientIp);
    
    next();
  } catch (rateLimiterRes) {
    logger.warn('Rate limit exceeded', {
      ip: clientIp,
      url: req.url,
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many requests',
      retryAfter: Math.round((rateLimiterRes as any).msBeforeNext / 1000) || 60,
    });
    return;
  }
}

// 로그인 시도 rate limiting
export async function loginRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const clientIp = getClientIp(req);
  const email = req.body.email || 'unknown';
  const key = `${clientIp}:${email}`;
  
  try {
    await strictRateLimiter.consume(key);
    next();
  } catch (rateLimiterRes) {
    logger.warn('Login rate limit exceeded', {
      ip: clientIp,
      email,
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again later.',
      retryAfter: Math.round((rateLimiterRes as any).msBeforeNext / 1000) || 3600,
    });
    return;
  }
}

// 보안 헤더 설정
export function securityHeaders(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 기본 보안 헤더
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HSTS (HTTPS인 경우에만)
  if (req.secure) {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  next();
}

// IP 차단 해제 함수 (관리자용)
export async function unblockIP(ip: string): Promise<void> {
  blockedIPs.delete(ip);
  if (redis) {
    await redis.del(`blocked:${ip}`);
  }
  logger.info('IP unblocked', { ip });
}

// 차단된 IP 목록 조회 (관리자용)
export async function getBlockedIPs(): Promise<string[]> {
  const localBlocked = Array.from(blockedIPs);
  
  if (redis) {
    const keys = await redis.keys('blocked:*');
    const redisBlocked = keys.map(key => key.replace('blocked:', ''));
    return [...new Set([...localBlocked, ...redisBlocked])];
  }
  
  return localBlocked;
}