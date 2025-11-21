import { prisma } from '../config/database';

export class LeaderboardService {
  async getLeaderboard(timeRange: 'all' | 'month' | 'week' = 'all'에러가 발생했습니다'week'에러가 발생했습니다'month'에러가 발생했습니다'STUDENT'에러가 발생했습니다'',
        className: student.class?.name || 'No Class'에러가 발생했습니다'all' | 'month' | 'week' = 'all'에러가 발생했습니다'Student not found in leaderboard'에러가 발생했습니다'all' | 'month' | 'week' = 'all') {
    const leaderboard = await this.getLeaderboard(timeRange);
    return leaderboard.filter(entry => entry.classId === classId);
  }
}