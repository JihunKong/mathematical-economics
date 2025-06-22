import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt-improved';
import { AppError } from './errorHandler';
import { ImprovedAuthService } from '../services/authService-improved';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const authService = new ImprovedAuthService();

export const authenticateImproved = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      throw new AppError('로그인이 필요합니다.\n\n' +
        '로그인 후 다시 시도해주세요.', 401);
    }

    try {
      const decoded = await authService.verifyToken(token);
      
      // Access token 타입 확인
      if (decoded.type !== 'access') {
        throw new AppError('유효하지 않은 토큰 타입입니다.', 401);
      }
      
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        // 토큰 만료 시 클라이언트에게 리프레시 필요함을 알림
        res.status(401).json({
          success: false,
          message: '토큰이 만료되었습니다.',
          code: 'TOKEN_EXPIRED',
          requireRefresh: true,
        });
        return;
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('유효하지 않은 로그인 정보입니다.\n\n' +
          '다시 로그인해주세요.', 401);
      } else {
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
};

// Bearer 토큰 추출 함수
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // 쿠키에서도 토큰 확인 (선택사항)
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }
  
  return null;
}

// 권한 확인 미들웨어
export const authorizeImproved = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('인증이 필요합니다.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('이 작업을 수행할 권한이 없습니다.\n\n' +
        `필요한 권한: ${roles.join(', ')}\n` +
        `현재 권한: ${req.user.role}`, 403));
    }

    next();
  };
};

// 선택적 인증 미들웨어 (로그인하지 않아도 접근 가능하지만, 로그인 시 사용자 정보 추가)
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);
    
    if (token) {
      try {
        const decoded = await authService.verifyToken(token);
        
        if (decoded.type === 'access') {
          req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
          };
        }
      } catch (error) {
        // 토큰이 유효하지 않아도 계속 진행
        logger.debug('Optional auth: Invalid token, continuing without auth');
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// 리프레시 토큰 검증 미들웨어
export const validateRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    
    if (!refreshToken) {
      throw new AppError('리프레시 토큰이 필요합니다.', 400);
    }
    
    req.body.refreshToken = refreshToken;
    next();
  } catch (error) {
    next(error);
  }
};