import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger'에러가 발생했습니다'Internal Server Error'에러가 발생했습니다'production' && statusCode === 500
      ? 'Internal Server Error'에러가 발생했습니다'development' && { stack: err.stack })
  });
};

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}