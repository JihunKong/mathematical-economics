import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/appError'에러가 발생했습니다'STUDENT') {
    return next(new AppError('이 기능은 학생만 사용할 수 있습니다.'에러가 발생했습니다'TEACHER') {
    return next(new AppError('이 기능은 교사만 사용할 수 있습니다.'에러가 발생했습니다'TEACHER' && req.user.role !== 'ADMIN')) {
    return next(new AppError('이 기능은 교사 또는 관리자만 사용할 수 있습니다.'에러가 발생했습니다'ADMIN') {
    return next(new AppError('이 기능은 관리자만 사용할 수 있습니다.'에러가 발생했습니다'STUDENT' && req.user.role !== 'ADMIN')) {
    return next(new AppError('이 기능은 학생만 사용할 수 있습니다.', 403));
  }
  next();
};