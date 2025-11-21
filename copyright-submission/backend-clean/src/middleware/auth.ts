import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { AppError } from './errorHandler'에러가 발생했습니다'🔑 로그인이 필요합니다.\n\n' +
        '💡 로그인 후 다시 시도해주세요.'에러가 발생했습니다'⏰ 로그인 세션이 만료되었습니다.\n\n' +
        '🔄 다시 로그인해주세요.', 401));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('❌ 유효하지 않은 로그인 정보입니다.\n\n' +
        '🔄 다시 로그인해주세요.'에러가 발생했습니다'🔐 로그인이 필요한 서비스입니다.\n\n' +
        '💡 로그인 후 이용해주세요.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('🚫 접근 권한이 없습니다.\n\n' +
        '💡 이 기능은 선생님만 사용할 수 있어요.\n' +
        '❓ 문제가 있다면 선생님께 문의해주세요.'에러가 발생했습니다'Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
};