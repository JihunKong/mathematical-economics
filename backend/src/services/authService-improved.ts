import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/encryption';
import { jwtConfig, accessTokenOptions, refreshTokenOptions, keyManager } from '../config/jwt-improved';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';
import { logger } from '../utils/logger';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  classCode?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

export class ImprovedAuthService {
  async register(data: RegisterData) {
    const { email, password, name, role = UserRole.STUDENT, classCode } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('이미 가입된 이메일입니다.\n\n' +
        '다른 이메일을 사용하거나, 비밀번호를 잊으셨다면 선생님께 문의해주세요.', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Find class if classCode is provided
    let classId: string | null = null;
    if (classCode && role === UserRole.STUDENT) {
      const classRoom = await prisma.class.findUnique({
        where: { code: classCode },
      });

      if (!classRoom) {
        throw new AppError('올바르지 않은 학급 코드입니다.\n\n' +
          '선생님께 받은 학급 코드를 다시 확인해주세요.\n' +
          '대소문자를 구분하니 정확히 입력해주세요.', 400);
      }

      classId = classRoom.id;
    }

    // Set funds based on role
    const getFundsForRole = (userRole: UserRole) => {
      if (userRole === UserRole.ADMIN || userRole === UserRole.TEACHER) {
        return { currentCash: null, initialCapital: null };
      }
      return { currentCash: 10000000, initialCapital: 10000000 };
    };

    const funds = getFundsForRole(role);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        classId,
        ...funds,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        classId: true,
        currentCash: true,
        initialCapital: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user,
      ...tokens,
    };
  }

  async login(data: LoginData) {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      throw new AppError('이메일 또는 비밀번호가 올바르지 않습니다.\n\n' +
        '확인사항:\n' +
        '• 이메일 주소가 정확한지 확인해주세요\n' +
        '• 비밀번호 대소문자를 확인해주세요\n' +
        '• Caps Lock이 켜져있지 않은지 확인해주세요', 401);
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    
    if (!isValidPassword) {
      logger.warn(`Failed login attempt for email: ${email}`);
      throw new AppError('이메일 또는 비밀번호가 올바르지 않습니다.\n\n' +
        '확인사항:\n' +
        '• 이메일 주소가 정확한지 확인해주세요\n' +
        '• 비밀번호 대소문자를 확인해주세요\n' +
        '• Caps Lock이 켜져있지 않은지 확인해주세요', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('계정이 비활성화되었습니다.\n\n' +
        '선생님께 문의해주세요.', 403);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // 로그인 성공 로깅
    logger.info(`User logged in successfully: ${email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        classId: user.classId,
        currentCash: user.currentCash,
        initialCapital: user.initialCapital,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // 먼저 현재 키로 검증 시도
      let decoded: TokenPayload;
      try {
        decoded = jwt.verify(refreshToken, jwtConfig.secret, {
          issuer: jwtConfig.issuer,
          audience: jwtConfig.audience,
        }) as TokenPayload;
      } catch (error) {
        // 현재 키로 실패하면 이전 키로 시도
        if (jwtConfig.previousSecret) {
          try {
            decoded = jwt.verify(refreshToken, jwtConfig.previousSecret, {
              issuer: jwtConfig.issuer,
              audience: jwtConfig.audience,
            }) as TokenPayload;
            logger.info('Refresh token verified with previous key');
          } catch (prevError) {
            throw new AppError('유효하지 않은 리프레시 토큰입니다.', 401);
          }
        } else {
          throw new AppError('유효하지 않은 리프레시 토큰입니다.', 401);
        }
      }

      // 리프레시 토큰 타입 확인
      if (decoded.type !== 'refresh') {
        throw new AppError('유효하지 않은 토큰 타입입니다.', 401);
      }

      // 사용자 확인
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new AppError('사용자를 찾을 수 없거나 비활성화되었습니다.', 401);
      }

      // 새 토큰 발급
      const tokens = await this.generateTokens(user);
      
      logger.info(`Token refreshed for user: ${user.email}`);

      return tokens;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('리프레시 토큰이 만료되었습니다. 다시 로그인해주세요.', 401);
      }
      throw error;
    }
  }

  private async generateTokens(user: any) {
    const accessPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const refreshPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      type: 'refresh',
    };

    const accessToken = jwt.sign(accessPayload, jwtConfig.secret, accessTokenOptions);
    const refreshToken = jwt.sign(refreshPayload, jwtConfig.secret, refreshTokenOptions);

    // 리프레시 토큰을 데이터베이스에 저장 (선택사항)
    // 이렇게 하면 로그아웃 시 토큰을 무효화할 수 있음
    // await this.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15분 (초 단위)
    };
  }

  async logout(userId: string, refreshToken?: string) {
    // 리프레시 토큰을 데이터베이스에서 제거 (구현한 경우)
    // await this.removeRefreshToken(userId, refreshToken);
    
    logger.info(`User logged out: ${userId}`);
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      // 먼저 현재 키로 검증 시도
      return jwt.verify(token, jwtConfig.secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      }) as TokenPayload;
    } catch (error) {
      // 현재 키로 실패하면 이전 키로 시도
      if (jwtConfig.previousSecret) {
        try {
          const decoded = jwt.verify(token, jwtConfig.previousSecret, {
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience,
          }) as TokenPayload;
          logger.info('Token verified with previous key');
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