import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/encryption';
import { jwtConfig, jwtSignOptions } from '../config/jwt';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client'에러가 발생했습니다'🚫 이미 가입된 이메일입니다.\n\n' +
        '💡 다른 이메일을 사용하거나, 비밀번호를 잊으셨다면 선생님께 문의해주세요.'에러가 발생했습니다'❌ 올바르지 않은 학급 코드입니다.\n\n' +
          '📝 선생님께 받은 학급 코드를 다시 확인해주세요.\n' +
          '💡 대소문자를 구분하니 정확히 입력해주세요.'에러가 발생했습니다'🔐 이메일 또는 비밀번호가 올바르지 않습니다.\n\n' +
        '💡 확인사항:\n' +
        '• 이메일 주소가 정확한지 확인해주세요\n' +
        '• 비밀번호 대소문자를 확인해주세요\n' +
        '• Caps Lock이 켜져있지 않은지 확인해주세요', 401);
    }

    if (!user.isActive) {
      throw new AppError('🚫 계정이 비활성화되었습니다.\n\n' +
        '💡 선생님께 문의하여 계정을 다시 활성화해주세요.'에러가 발생했습니다'🔐 이메일 또는 비밀번호가 올바르지 않습니다.\n\n' +
        '💡 확인사항:\n' +
        '• 이메일 주소가 정확한지 확인해주세요\n' +
        '• 비밀번호 대소문자를 확인해주세요\n' +
        '• Caps Lock이 켜져있지 않은지 확인해주세요'에러가 발생했습니다'⏰ 로그인 세션이 만료되었습니다.\n\n' +
          '🔄 다시 로그인해주세요.'에러가 발생했습니다'⏰ 로그인 세션이 만료되었습니다.\n\n' +
        '🔄 다시 로그인해주세요.'에러가 발생했습니다'HS256',
    } as SignOptions);

    return {
      accessToken,
      refreshToken,
    };
  }
}