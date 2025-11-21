import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/encryption';
import { jwtConfig, accessTokenOptions, refreshTokenOptions, keyManager } from '../config/jwt-improved';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';
import { logger } from '../utils/logger'에러가 발생했습니다'access' | 'refresh'에러가 발생했습니다'이미 가입된 이메일입니다.\n\n' +
        '다른 이메일을 사용하거나, 비밀번호를 잊으셨다면 선생님께 문의해주세요.'에러가 발생했습니다'올바르지 않은 학급 코드입니다.\n\n' +
          '선생님께 받은 학급 코드를 다시 확인해주세요.\n' +
          '대소문자를 구분하니 정확히 입력해주세요.'에러가 발생했습니다'이메일 또는 비밀번호가 올바르지 않습니다.\n\n' +
        '확인사항:\n' +
        '• 이메일 주소가 정확한지 확인해주세요\n' +
        '• 비밀번호 대소문자를 확인해주세요\n' +
        '• Caps Lock이 켜져있지 않은지 확인해주세요'에러가 발생했습니다'이메일 또는 비밀번호가 올바르지 않습니다.\n\n' +
        '확인사항:\n' +
        '• 이메일 주소가 정확한지 확인해주세요\n' +
        '• 비밀번호 대소문자를 확인해주세요\n' +
        '• Caps Lock이 켜져있지 않은지 확인해주세요', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('계정이 비활성화되었습니다.\n\n' +
        '선생님께 문의해주세요.'에러가 발생했습니다'Refresh token verified with previous key');
          } catch (prevError) {
            throw new AppError('유효하지 않은 리프레시 토큰입니다.', 401);
          }
        } else {
          throw new AppError('유효하지 않은 리프레시 토큰입니다.', 401);
        }
      }

      // 리프레시 토큰 타입 확인
      if (decoded.type !== 'refresh') {
        throw new AppError('유효하지 않은 토큰 타입입니다.'에러가 발생했습니다'사용자를 찾을 수 없거나 비활성화되었습니다.'에러가 발생했습니다'리프레시 토큰이 만료되었습니다. 다시 로그인해주세요.'에러가 발생했습니다'access'에러가 발생했습니다'refresh'에러가 발생했습니다'Token verified with previous key');
          return decoded;
        } catch (prevError) {
          // 두 키 모두 실패
          throw error;
        }
      }
      throw error;
    }
  }
}