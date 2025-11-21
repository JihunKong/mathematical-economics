import { Response, NextFunction } from 'express';
import { TeacherService } from '../services/teacherService';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler'에러가 발생했습니다'🔐 로그인이 필요합니다.\n\n' +
        '💡 로그인 후 다시 시도해주세요.', 401);
    }

    if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
      throw new AppError('🏫 선생님만 학급을 만들 수 있습니다.\n\n' +
        '💡 학생 계정으로는 이 기능을 사용할 수 없어요.'에러가 발생했습니다's classes
export const getTeacherClasses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.role !== 'TEACHER' && req.user?.role !== 'ADMIN') {
      throw new AppError('🚫 선생님만 접근할 수 있는 메뉴입니다.\n\n' +
        '💡 학생 계정으로는 이 정보를 볼 수 없어요.'에러가 발생했습니다'TEACHER' && req.user?.role !== 'ADMIN') {
      throw new AppError('🚫 선생님만 접근할 수 있는 메뉴입니다.\n\n' +
        '💡 학생 계정으로는 이 정보를 볼 수 없어요.'에러가 발생했습니다'TEACHER' && req.user?.role !== 'ADMIN') {
      throw new AppError('📊 선생님만 학생 활동을 확인할 수 있습니다.\n\n' +
        '💡 학생 계정으로는 다른 학생의 활동을 볼 수 없어요.'에러가 발생했습니다'TEACHER' && req.user?.role !== 'ADMIN') {
      throw new AppError('📊 선생님만 학급 통계를 확인할 수 있습니다.\n\n' +
        '💡 학생 계정으로는 학급 전체 통계를 볼 수 없어요.'에러가 발생했습니다's cash balance
export const updateStudentCash = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.role !== 'TEACHER' && req.user?.role !== 'ADMIN') {
      throw new AppError('💰 선생님만 학생의 투자금을 수정할 수 있습니다.\n\n' +
        '💡 학생 계정으로는 투자금을 변경할 수 없어요.'에러가 발생했습니다'number' || newCash < 0) {
      throw new AppError('❌ 잘못된 금액입니다.\n\n' +
        '💡 0원 이상의 금액을 입력해주세요.', 400);
    }

    const updatedStudent = await teacherService.updateStudentCash(
      req.user.id,
      studentId,
      newCash
    );

    res.status(200).json({
      success: true,
      data: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};