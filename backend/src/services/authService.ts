import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/encryption';
import { jwtConfig, jwtSignOptions } from '../config/jwt';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

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

export class AuthService {
  async register(data: RegisterData) {
    const { email, password, name, role = UserRole.STUDENT, classCode } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('🚫 이미 가입된 이메일입니다.\n\n' +
        '💡 다른 이메일을 사용하거나, 비밀번호를 잊으셨다면 선생님께 문의해주세요.', 400);
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
        throw new AppError('❌ 올바르지 않은 학급 코드입니다.\n\n' +
          '📝 선생님께 받은 학급 코드를 다시 확인해주세요.\n' +
          '💡 대소문자를 구분하니 정확히 입력해주세요.', 400);
      }

      classId = classRoom.id;
    }

    // Set funds based on role - ADMIN/TEACHER get null, STUDENT gets default amount
    const getFundsForRole = (userRole: UserRole) => {
      if (userRole === UserRole.ADMIN || userRole === UserRole.TEACHER) {
        return { currentCash: null, initialCapital: null };
      }
      return { currentCash: 10000000, initialCapital: 10000000 }; // 10 million won for students
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
    const tokens = this.generateTokens(user);

    return {
      user,
      ...tokens,
    };
  }

  async login(data: LoginData) {
    const { email, password } = data;
    
    console.log('Login attempt for email:', email);
    console.log('Password received:', password ? 'Yes' : 'No');

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        classId: true,
        isActive: true,
      },
    });

    if (!user) {
      console.log('User not found for email:', email);
      throw new AppError('🔐 이메일 또는 비밀번호가 올바르지 않습니다.\n\n' +
        '💡 확인사항:\n' +
        '• 이메일 주소가 정확한지 확인해주세요\n' +
        '• 비밀번호 대소문자를 확인해주세요\n' +
        '• Caps Lock이 켜져있지 않은지 확인해주세요', 401);
    }

    if (!user.isActive) {
      throw new AppError('🚫 계정이 비활성화되었습니다.\n\n' +
        '💡 선생님께 문의하여 계정을 다시 활성화해주세요.', 401);
    }

    // Remove GUEST check since we're not using GUEST role anymore

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('🔐 이메일 또는 비밀번호가 올바르지 않습니다.\n\n' +
        '💡 확인사항:\n' +
        '• 이메일 주소가 정확한지 확인해주세요\n' +
        '• 비밀번호 대소문자를 확인해주세요\n' +
        '• Caps Lock이 켜져있지 않은지 확인해주세요', 401);
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, jwtConfig.secret) as any;

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          classId: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new AppError('⏰ 로그인 세션이 만료되었습니다.\n\n' +
          '🔄 다시 로그인해주세요.', 401);
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      return {
        user,
        ...tokens,
      };
    } catch (error) {
      throw new AppError('⏰ 로그인 세션이 만료되었습니다.\n\n' +
        '🔄 다시 로그인해주세요.', 401);
    }
  }

  private generateTokens(user: any) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, jwtConfig.secret, jwtSignOptions);
    
    const refreshToken = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.refreshExpiresIn as string,
      algorithm: 'HS256',
    } as SignOptions);

    return {
      accessToken,
      refreshToken,
    };
  }
}