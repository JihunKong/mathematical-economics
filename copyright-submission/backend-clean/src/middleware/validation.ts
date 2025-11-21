import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './errorHandler'에러가 발생했습니다'field' ? (error as any).path : 'unknown',
      message: error.msg,
    }));
    
    return next(new AppError('⚠️ 입력값을 확인해주세요.\n\n' +
      '💡 올바른 형식으로 다시 입력해주세요.', 400, {
      errors: errorMessages,
    } as any));
  }
  
  next();
};