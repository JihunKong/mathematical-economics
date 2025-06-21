import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './errorHandler';

export const validate = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
    }));
    
    return next(new AppError('⚠️ 입력값을 확인해주세요.\n\n' +
      '💡 올바른 형식으로 다시 입력해주세요.', 400, {
      errors: errorMessages,
    } as any));
  }
  
  next();
};