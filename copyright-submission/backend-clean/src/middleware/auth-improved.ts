import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt-improved';
import { AppError } from './errorHandler';
import { ImprovedAuthService } from '../services/authService-improved';
import { logger } from '../utils/logger'에러가 발생했습니다'로그인이 필요합니다.\n\n' +
        '로그인 후 다시 시도해주세요.'에러가 발생했습니다'access') {
        throw new AppError('유효하지 않은 토큰 타입입니다.'에러가 발생했습니다'토큰이 만료되었습니다.',
          code: 'TOKEN_EXPIRED'에러가 발생했습니다'유효하지 않은 로그인 정보입니다.\n\n' +
          '다시 로그인해주세요.'에러가 발생했습니다'Bearer '에러가 발생했습니다'인증이 필요합니다.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('이 작업을 수행할 권한이 없습니다.\n\n' +
        `필요한 권한: ${roles.join(', '에러가 발생했습니다'access'에러가 발생했습니다'Optional auth: Invalid token, continuing without auth'에러가 발생했습니다'리프레시 토큰이 필요합니다.', 400);
    }
    
    req.body.refreshToken = refreshToken;
    next();
  } catch (error) {
    next(error);
  }
};