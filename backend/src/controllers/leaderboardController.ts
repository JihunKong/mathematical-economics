import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { LeaderboardService } from '../services/leaderboardService';
import { catchAsync } from '../utils/catchAsync';

const leaderboardService = new LeaderboardService();

export const getLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const { timeRange = 'all', limit = 50 } = req.query;
  
  const validTimeRanges = ['all', 'month', 'week'];
  const selectedTimeRange = validTimeRanges.includes(timeRange as string) 
    ? (timeRange as 'all' | 'month' | 'week')
    : 'all';

  const leaderboard = await leaderboardService.getLeaderboard(
    selectedTimeRange,
    parseInt(limit as string) || 50
  );

  res.json({
    success: true,
    data: leaderboard
  });
});

export const getStudentRank = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { timeRange = 'all' } = req.query;
  
  const validTimeRanges = ['all', 'month', 'week'];
  const selectedTimeRange = validTimeRanges.includes(timeRange as string) 
    ? (timeRange as 'all' | 'month' | 'week')
    : 'all';

  const rankData = await leaderboardService.getStudentRank(userId, selectedTimeRange);

  res.json({
    success: true,
    data: rankData
  });
});

export const getClassLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const { classId } = req.params;
  const { timeRange = 'all' } = req.query;
  
  const validTimeRanges = ['all', 'month', 'week'];
  const selectedTimeRange = validTimeRanges.includes(timeRange as string) 
    ? (timeRange as 'all' | 'month' | 'week')
    : 'all';

  const leaderboard = await leaderboardService.getClassLeaderboard(classId, selectedTimeRange);

  res.json({
    success: true,
    data: leaderboard
  });
});