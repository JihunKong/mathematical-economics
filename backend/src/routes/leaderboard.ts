import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as leaderboardController from '../controllers/leaderboardController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get overall leaderboard
router.get('/', leaderboardController.getLeaderboard);

// Get current user's rank
router.get('/my-rank', leaderboardController.getStudentRank);

// Get class-specific leaderboard
router.get('/class/:classId', leaderboardController.getClassLeaderboard);

export default router;