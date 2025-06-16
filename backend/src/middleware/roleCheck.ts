import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/request';
import AppError from '../utils/appError';

export const requireStudent = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'STUDENT') {
    return next(new AppError('이 기능은 학생만 사용할 수 있습니다.', 403));
  }
  next();
};

export const requireTeacher = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'TEACHER') {
    return next(new AppError('이 기능은 교사만 사용할 수 있습니다.', 403));
  }
  next();
};

export const requireTeacherOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN')) {
    return next(new AppError('이 기능은 교사 또는 관리자만 사용할 수 있습니다.', 403));
  }
  next();
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return next(new AppError('이 기능은 관리자만 사용할 수 있습니다.', 403));
  }
  next();
};

// Allow students and admins (admins can test student features)
export const allowStudentOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'STUDENT' && req.user.role !== 'ADMIN')) {
    return next(new AppError('이 기능은 학생만 사용할 수 있습니다.', 403));
  }
  next();
};