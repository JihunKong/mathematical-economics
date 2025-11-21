import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as leaderboardController from '../controllers/leaderboardController'에러가 발생했습니다'/', leaderboardController.getLeaderboard);

// Get current user's rank
router.get('/my-rank', leaderboardController.getStudentRank);

// Get class-specific leaderboard
router.get('/class/:classId', leaderboardController.getClassLeaderboard);

export default router;