import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';
import { hashPassword } from '../utils/encryption';

// Get all inactive users
export const getPendingUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: {
        isActive: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: pendingUsers,
    });
  } catch (error) {
    next(error);
  }
};

// Approve user and assign role
export const approveUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    if (!role || !['STUDENT', 'TEACHER'].includes(role)) {
      throw new AppError('❌ 잘못된 역할입니다.\n\n' +
        '💡 STUDENT(학생) 또는 TEACHER(선생님)만 선택할 수 있어요.', 400);
    }

    // Update user role and activate
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        role: role as UserRole,
        isActive: true // Activate the user
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // Create portfolio for approved user
    await prisma.portfolio.create({
      data: {
        userId: userId,
        totalValue: updatedUser.role === UserRole.STUDENT ? 10000000 : 0,
        totalCost: 0,
        totalProfitLoss: 0,
        totalProfitLossPercent: 0,
      },
    });

    res.json({
      success: true,
      message: `User approved as ${role}`,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Reject user (delete account)
export const rejectUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true,
        teacherClasses: { select: { id: true } }
      },
    });

    if (!user) {
      throw new AppError('👤 사용자를 찾을 수 없습니다.\\n\\n' +
        '🔍 사용자 ID를 다시 확인해주세요.', 404);
    }

    // Prevent deletion of admin users
    if (user.role === 'ADMIN') {
      throw new AppError('⚠️ 관리자 계정은 삭제할 수 없습니다.\\n\\n' +
        '🔒 보안을 위해 관리자 계정 삭제는 제한됩니다.', 403);
    }

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // 1. Delete related data first to avoid foreign key constraints

      // Delete transactions
      await tx.transaction.deleteMany({
        where: { userId }
      });

      // Delete holdings
      await tx.holding.deleteMany({
        where: { userId }
      });

      // Delete portfolios
      await tx.portfolio.deleteMany({
        where: { userId }
      });

      // Delete watchlist entries
      await tx.watchlist.deleteMany({
        where: { userId }
      });

      // Delete notifications
      await tx.notification.deleteMany({
        where: { userId }
      });

      // 2. Handle teacher-specific deletions
      if (user.role === 'TEACHER' && user.teacherClasses.length > 0) {
        // Get all classes taught by this teacher
        const teacherClasses = await tx.class.findMany({
          where: { teacherId: userId },
          include: { students: true }
        });

        for (const classItem of teacherClasses) {
          // Remove students from the class
          await tx.user.updateMany({
            where: { classId: classItem.id },
            data: { classId: null }
          });

          // Delete allowed stocks for this class
          await tx.allowedStock.deleteMany({
            where: { classId: classItem.id }
          });

          // Delete the class
          await tx.class.delete({
            where: { id: classItem.id }
          });
        }
      }

      // 3. Finally delete the user
      await tx.user.delete({
        where: { id: userId }
      });
    });

    res.json({
      success: true,
      message: 'User account rejected and deleted',
    });
  } catch (error) {
    next(error);
  }
};

// Get all users for management
export const getAllUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        class: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// Reset user password
export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      throw new AppError('🔐 비밀번호는 최소 6자 이상이어야 합니다.\n\n' +
        '💡 보안을 위해 긴 비밀번호를 사용해주세요.', 400);
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Deactivate/activate user
export const toggleUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true },
    });

    if (!user) {
      throw new AppError('👤 사용자를 찾을 수 없습니다.\n\n' +
        '🔍 사용자 ID를 다시 확인해주세요.', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    res.json({
      success: true,
      message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (works for both active and inactive users)
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true,
        teacherClasses: { select: { id: true } }
      },
    });

    if (!user) {
      throw new AppError('👤 사용자를 찾을 수 없습니다.\n\n' +
        '🔍 사용자 ID를 다시 확인해주세요.', 404);
    }

    // Prevent deletion of admin users
    if (user.role === 'ADMIN') {
      throw new AppError('⚠️ 관리자 계정은 삭제할 수 없습니다.\n\n' +
        '🔒 보안을 위해 관리자 계정 삭제는 제한됩니다.', 403);
    }

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // 1. Delete related data first to avoid foreign key constraints

      // Delete transactions
      await tx.transaction.deleteMany({
        where: { userId }
      });

      // Delete holdings
      await tx.holding.deleteMany({
        where: { userId }
      });

      // Delete portfolios
      await tx.portfolio.deleteMany({
        where: { userId }
      });

      // Delete watchlist entries
      await tx.watchlist.deleteMany({
        where: { userId }
      });

      // Delete notifications
      await tx.notification.deleteMany({
        where: { userId }
      });

      // 2. Handle teacher-specific deletions
      if (user.role === 'TEACHER' && user.teacherClasses.length > 0) {
        // Get all classes taught by this teacher
        const teacherClasses = await tx.class.findMany({
          where: { teacherId: userId },
          include: { students: true }
        });

        for (const classItem of teacherClasses) {
          // Remove students from the class
          await tx.user.updateMany({
            where: { classId: classItem.id },
            data: { classId: null }
          });

          // Delete allowed stocks for this class
          await tx.allowedStock.deleteMany({
            where: { classId: classItem.id }
          });

          // Delete the class
          await tx.class.delete({
            where: { id: classItem.id }
          });
        }
      }

      // 3. If user is a student, remove from class
      if (user.role === 'STUDENT') {
        // No need to do anything special, just remove the user
      }

      // 4. Finally delete the user
      await tx.user.delete({
        where: { id: userId }
      });
    });

    res.json({
      success: true,
      message: `사용자 ${user.name} (${user.email})가 성공적으로 삭제되었습니다.`,
      data: {
        deletedUser: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create teacher account directly by admin
export const createTeacherAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, password } = req.body;

    // Validate inputs
    if (!email || !name || !password) {
      throw new AppError('📄 필수 정보가 비어있습니다.\n\n' +
        '✅ 이메일, 이름, 비밀번호를 모두 입력해주세요.', 400);
    }

    if (password.length < 6) {
      throw new AppError('🔐 비밀번호는 최소 6자 이상이어야 합니다.\n\n' +
        '💡 보안을 위해 긴 비밀번호를 사용해주세요.', 400);
    }

    if (!/\d/.test(password)) {
      throw new AppError('🔢 비밀번호에는 숫자가 하나 이상 포함되어야 합니다.\n\n' +
        '💡 보안을 위해 숫자를 포함한 비밀번호를 사용해주세요.', 400);
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('🚫 이미 사용 중인 이메일입니다.\n\n' +
        '💡 다른 이메일을 사용해주세요.', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create teacher account
    const teacher = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: UserRole.TEACHER,
        isActive: true, // Teachers created by admin are immediately active
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Create portfolio for teacher (with 0 balance)
    await prisma.portfolio.create({
      data: {
        userId: teacher.id,
        totalValue: 0,
        totalCost: 0,
        totalProfitLoss: 0,
        totalProfitLossPercent: 0,
      },
    });

    res.json({
      success: true,
      message: 'Teacher account created successfully',
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};