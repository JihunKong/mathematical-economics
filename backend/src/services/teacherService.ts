import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class TeacherService {
  // Create a new class
  async createClass(teacherId: string, data: { name: string; startDate: Date | string; endDate?: Date | string }) {
    // Generate unique class code
    const code = await this.generateClassCode();
    
    // Ensure dates are properly formatted
    const formatDate = (date: Date | string): Date => {
      if (typeof date === 'string') {
        // If date string doesn't include time, add it
        if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return new Date(date + 'T00:00:00.000Z');
        }
        return new Date(date);
      }
      return date;
    };
    
    const startDate = formatDate(data.startDate);
    const endDate = data.endDate ? formatDate(data.endDate) : undefined;
    
    const newClass = await prisma.class.create({
      data: {
        name: data.name,
        code,
        teacherId,
        startDate,
        endDate,
      },
    });

    return newClass;
  }

  // Get teacher's classes
  async getTeacherClasses(teacherId: string) {
    const classes = await prisma.class.findMany({
      where: { teacherId },
      include: {
        _count: {
          select: {
            students: true,
            allowedStocks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return classes;
  }

  // Get class details with students
  async getClassDetails(classId: string, teacherId: string) {
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId,
      },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            email: true,
            currentCash: true,
            createdAt: true,
          },
        },
        allowedStocks: {
          include: {
            stock: true,
          },
          where: {
            isActive: true,
          },
        },
      },
    });

    if (!classData) {
      throw new AppError('Class not found', 404);
    }

    // Get portfolio values for each student
    const studentsWithPortfolio = await Promise.all(
      classData.students.map(async (student) => {
        const portfolio = await prisma.portfolio.findFirst({
          where: { userId: student.id },
        });

        const holdings = await prisma.holding.findMany({
          where: { userId: student.id },
          include: { stock: true },
        });

        const totalHoldingsValue = holdings.reduce(
          (sum, holding) => sum + (holding.quantity * holding.stock.currentPrice),
          0
        );

        return {
          ...student,
          totalValue: student.currentCash + totalHoldingsValue,
          totalProfitLoss: portfolio?.totalProfitLoss || 0,
          totalProfitLossPercent: portfolio?.totalProfitLossPercent || 0,
          holdingsCount: holdings.length,
        };
      })
    );

    return {
      ...classData,
      students: studentsWithPortfolio,
    };
  }

  // Manage allowed stocks for a class
  async updateAllowedStocks(
    classId: string,
    teacherId: string,
    stockIds: string[]
  ) {
    // Verify teacher owns the class
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId,
      },
    });

    if (!classData) {
      throw new AppError('Class not found', 404);
    }

    // Get current allowed stocks
    const currentAllowed = await prisma.allowedStock.findMany({
      where: { classId },
    });

    const currentStockIds = currentAllowed.map(a => a.stockId);
    const toAdd = stockIds.filter(id => !currentStockIds.includes(id));
    const toRemove = currentStockIds.filter(id => !stockIds.includes(id));

    // Use transaction to update allowed stocks
    await prisma.$transaction(async (tx) => {
      // Deactivate removed stocks
      if (toRemove.length > 0) {
        await tx.allowedStock.updateMany({
          where: {
            classId,
            stockId: { in: toRemove },
          },
          data: {
            isActive: false,
          },
        });
      }

      // Add new stocks
      if (toAdd.length > 0) {
        const existingInactive = await tx.allowedStock.findMany({
          where: {
            classId,
            stockId: { in: toAdd },
            isActive: false,
          },
        });

        const existingInactiveIds = existingInactive.map(e => e.stockId);
        const reallyNew = toAdd.filter(id => !existingInactiveIds.includes(id));

        // Reactivate existing inactive stocks
        if (existingInactiveIds.length > 0) {
          await tx.allowedStock.updateMany({
            where: {
              classId,
              stockId: { in: existingInactiveIds },
            },
            data: {
              isActive: true,
            },
          });
        }

        // Create new allowed stocks
        if (reallyNew.length > 0) {
          await tx.allowedStock.createMany({
            data: reallyNew.map(stockId => ({
              classId,
              stockId,
              addedBy: teacherId,
            })),
          });
        }
      }
    });

    // Return updated list
    const updatedAllowed = await prisma.allowedStock.findMany({
      where: {
        classId,
        isActive: true,
      },
      include: {
        stock: true,
      },
    });

    return updatedAllowed;
  }

  // Update student's cash balance
  async updateStudentCash(teacherId: string, studentId: string, newCash: number) {
    // Check if teacher owns the class that the student belongs to
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        class: true,
      },
    });

    if (!student || !student.classId) {
      throw new AppError('Student not found or not in a class', 404);
    }

    if (student.class?.teacherId !== teacherId) {
      throw new AppError('Not authorized to update this student', 403);
    }

    // Update student's cash
    const updatedStudent = await prisma.user.update({
      where: { id: studentId },
      data: {
        currentCash: newCash,
        initialCapital: newCash, // Also update initial capital
      },
      select: {
        id: true,
        name: true,
        email: true,
        currentCash: true,
        initialCapital: true,
      },
    });

    // Update portfolio total value
    await prisma.portfolio.updateMany({
      where: { userId: studentId },
      data: {
        totalValue: newCash,
      },
    });

    return updatedStudent;
  }

  // Get student trading activity
  async getStudentActivity(studentId: string, teacherId: string) {
    // Verify student belongs to teacher's class
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        class: {
          teacherId,
        },
      },
      include: {
        class: true,
      },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    // Get recent transactions with reasoning
    const transactions = await prisma.transaction.findMany({
      where: { userId: studentId },
      include: {
        stock: {
          select: {
            symbol: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Get current holdings
    const holdings = await prisma.holding.findMany({
      where: { userId: studentId },
      include: {
        stock: {
          select: {
            symbol: true,
            name: true,
            currentPrice: true,
          },
        },
      },
    });

    // Get portfolio summary
    const portfolio = await prisma.portfolio.findFirst({
      where: { userId: studentId },
    });

    return {
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        className: student.class?.name,
        currentCash: student.currentCash,
      },
      portfolio,
      holdings,
      transactions,
    };
  }

  // Get class-wide statistics
  async getClassStatistics(classId: string, teacherId: string) {
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId,
      },
      include: {
        students: true,
      },
    });

    if (!classData) {
      throw new AppError('Class not found', 404);
    }

    const studentIds = classData.students.map(s => s.id);

    // Get portfolio statistics
    const portfolios = await prisma.portfolio.findMany({
      where: {
        userId: { in: studentIds },
      },
    });

    // Calculate statistics
    const totalStudents = classData.students.length;
    const activeStudents = portfolios.length;
    const avgReturn = portfolios.reduce((sum, p) => sum + p.totalProfitLossPercent, 0) / portfolios.length || 0;
    const bestReturn = Math.max(...portfolios.map(p => p.totalProfitLossPercent), 0);
    const worstReturn = Math.min(...portfolios.map(p => p.totalProfitLossPercent), 0);

    // Get most traded stocks
    const transactions = await prisma.transaction.groupBy({
      by: ['stockId'],
      where: {
        userId: { in: studentIds },
      },
      _count: {
        stockId: true,
      },
      orderBy: {
        _count: {
          stockId: 'desc',
        },
      },
      take: 5,
    });

    const stockIds = transactions.map(t => t.stockId);
    const stocks = await prisma.stock.findMany({
      where: { id: { in: stockIds } },
    });

    const mostTradedStocks = transactions.map(t => {
      const stock = stocks.find(s => s.id === t.stockId);
      return {
        symbol: stock?.symbol,
        name: stock?.name,
        tradeCount: t._count.stockId,
      };
    });

    return {
      className: classData.name,
      totalStudents,
      activeStudents,
      avgReturn,
      bestReturn,
      worstReturn,
      mostTradedStocks,
    };
  }

  private async generateClassCode(): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    let exists = true;

    while (exists) {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      const existing = await prisma.class.findUnique({
        where: { code },
      });

      exists = !!existing;
    }

    return code!;
  }
}