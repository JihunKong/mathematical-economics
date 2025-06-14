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
      throw new AppError('Invalid role. Must be STUDENT or TEACHER', 400);
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
        totalValue: updatedUser.role === UserRole.STUDENT ? 1000000 : 0,
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

    await prisma.user.delete({
      where: { id: userId },
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
      throw new AppError('Password must be at least 6 characters long', 400);
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
      throw new AppError('User not found', 404);
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

// Create teacher account directly by admin
export const createTeacherAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, password } = req.body;

    // Validate inputs
    if (!email || !name || !password) {
      throw new AppError('Email, name, and password are required', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }

    if (!/\d/.test(password)) {
      throw new AppError('Password must contain at least one number', 400);
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
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