import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';
import { hashPassword } from '../utils/encryption'에러가 발생했습니다'desc'에러가 발생했습니다'STUDENT', 'TEACHER'].includes(role)) {
      throw new AppError('❌ 잘못된 역할입니다.\n\n' +
        '💡 STUDENT(학생) 또는 TEACHER(선생님)만 선택할 수 있어요.'에러가 발생했습니다'👤 사용자를 찾을 수 없습니다.\\n\\n' +
        '🔍 사용자 ID를 다시 확인해주세요.', 404);
    }

    // Prevent deletion of admin users
    if (user.role === 'ADMIN') {
      throw new AppError('⚠️ 관리자 계정은 삭제할 수 없습니다.\\n\\n' +
        '🔒 보안을 위해 관리자 계정 삭제는 제한됩니다.'에러가 발생했습니다'TEACHER'에러가 발생했습니다'User account rejected and deleted'에러가 발생했습니다'desc'에러가 발생했습니다'🔐 비밀번호는 최소 6자 이상이어야 합니다.\n\n' +
        '💡 보안을 위해 긴 비밀번호를 사용해주세요.'에러가 발생했습니다'Password reset successfully'에러가 발생했습니다'👤 사용자를 찾을 수 없습니다.\n\n' +
        '🔍 사용자 ID를 다시 확인해주세요.'에러가 발생했습니다'activated' : 'deactivated'에러가 발생했습니다'👤 사용자를 찾을 수 없습니다.\n\n' +
        '🔍 사용자 ID를 다시 확인해주세요.', 404);
    }

    // Prevent deletion of admin users
    if (user.role === 'ADMIN') {
      throw new AppError('⚠️ 관리자 계정은 삭제할 수 없습니다.\n\n' +
        '🔒 보안을 위해 관리자 계정 삭제는 제한됩니다.'에러가 발생했습니다'TEACHER'에러가 발생했습니다'STUDENT'에러가 발생했습니다'📄 필수 정보가 비어있습니다.\n\n' +
        '✅ 이메일, 이름, 비밀번호를 모두 입력해주세요.', 400);
    }

    if (password.length < 6) {
      throw new AppError('🔐 비밀번호는 최소 6자 이상이어야 합니다.\n\n' +
        '💡 보안을 위해 긴 비밀번호를 사용해주세요.', 400);
    }

    if (!/\d/.test(password)) {
      throw new AppError('🔢 비밀번호에는 숫자가 하나 이상 포함되어야 합니다.\n\n' +
        '💡 보안을 위해 숫자를 포함한 비밀번호를 사용해주세요.'에러가 발생했습니다'🚫 이미 사용 중인 이메일입니다.\n\n' +
        '💡 다른 이메일을 사용해주세요.'에러가 발생했습니다'Teacher account created successfully',
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};