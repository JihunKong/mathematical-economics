import { prisma } from '../config/database';

export class LeaderboardService {
  async getLeaderboard(timeRange: 'all' | 'month' | 'week' = 'all', limit: number = 50) {
    // Calculate date filter based on time range
    let dateFilter: Date | undefined;
    const now = new Date();
    
    switch (timeRange) {
      case 'week':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = undefined;
    }

    // Build the where clause for transactions if date filter is applied
    const transactionWhere = dateFilter ? {
      createdAt: {
        gte: dateFilter
      }
    } : {};

    // Get all students with their portfolios and transaction counts
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT'
      },
      include: {
        portfolios: true,
        holdings: {
          include: {
            stock: true
          }
        },
        transactions: {
          where: transactionWhere,
          select: {
            id: true
          }
        },
        class: true
      }
    });

    // Calculate metrics for each student
    const leaderboardData = await Promise.all(students.map(async (student) => {
      // Calculate total value (cash + holdings value)
      let totalHoldingsValue = 0;
      let totalInvestedAmount = 0;

      for (const holding of student.holdings) {
        const currentValue = Number(holding.quantity) * holding.stock.currentPrice;
        const investedAmount = Number(holding.quantity) * holding.averagePrice;
        
        totalHoldingsValue += currentValue;
        totalInvestedAmount += investedAmount;
      }

      const totalValue = student.currentCash + totalHoldingsValue;
      const totalProfitLoss = totalValue - student.initialCapital;
      const totalProfitLossPercent = ((totalValue - student.initialCapital) / student.initialCapital) * 100;

      return {
        userId: student.id,
        userName: student.name,
        classId: student.class?.id || '',
        className: student.class?.name || 'No Class',
        totalValue,
        totalProfitLoss,
        totalProfitLossPercent,
        holdingsCount: student.holdings.length,
        transactionCount: student.transactions.length
      };
    }));

    // Filter out null values and sort by total value
    const validLeaderboard = leaderboardData
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, limit);

    // Add ranks
    const rankedLeaderboard = validLeaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    return rankedLeaderboard;
  }

  async getStudentRank(userId: string, timeRange: 'all' | 'month' | 'week' = 'all') {
    const leaderboard = await this.getLeaderboard(timeRange, 1000);
    const studentEntry = leaderboard.find(entry => entry.userId === userId);
    
    if (!studentEntry) {
      throw new Error('Student not found in leaderboard');
    }

    return {
      ...studentEntry,
      totalStudents: leaderboard.length
    };
  }

  async getClassLeaderboard(classId: string, timeRange: 'all' | 'month' | 'week' = 'all') {
    const leaderboard = await this.getLeaderboard(timeRange);
    return leaderboard.filter(entry => entry.classId === classId);
  }
}