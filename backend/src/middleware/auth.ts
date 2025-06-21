import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      throw new AppError('🔑 로그인이 필요합니다.\n\n' +
        '💡 로그인 후 다시 시도해주세요.', 401);
    }

    const decoded = jwt.verify(token, jwtConfig.secret) as any;
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('⏰ 로그인 세션이 만료되었습니다.\n\n' +
        '🔄 다시 로그인해주세요.', 401));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('❌ 유효하지 않은 로그인 정보입니다.\n\n' +
        '🔄 다시 로그인해주세요.', 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('🔐 로그인이 필요한 서비스입니다.\n\n' +
        '💡 로그인 후 이용해주세요.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('🚫 접근 권한이 없습니다.\n\n' +
        '💡 이 기능은 선생님만 사용할 수 있어요.\n' +
        '❓ 문제가 있다면 선생님께 문의해주세요.', 403));
    }

    next();
  };
};

const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
};