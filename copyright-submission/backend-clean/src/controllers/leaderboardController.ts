import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { LeaderboardService } from '../services/leaderboardService';
import { catchAsync } from '../utils/catchAsync'에러가 발생했습니다'all', limit = 50 } = req.query;
  
  const validTimeRanges = ['all', 'month', 'week'];
  const selectedTimeRange = validTimeRanges.includes(timeRange as string) 
    ? (timeRange as 'all' | 'month' | 'week')
    : 'all'에러가 발생했습니다'all' } = req.query;
  
  const validTimeRanges = ['all', 'month', 'week'];
  const selectedTimeRange = validTimeRanges.includes(timeRange as string) 
    ? (timeRange as 'all' | 'month' | 'week')
    : 'all'에러가 발생했습니다'all' } = req.query;
  
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