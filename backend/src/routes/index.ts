import { Router } from 'express';
import authRoutes from './auth';
import stocksRoutes from './stocks';
import tradingRoutes from './trading';
import portfolioRoutes from './portfolio';
import usersRoutes from './users';
import leaderboardRoutes from './leaderboard';
import teacherRoutes from './teacher';
import realStockRoutes from './realStock';
import adminRoutes from './admin';
import stockManagementRoutes from './stockManagement';
import stockDataRoutes from './stockData';
import chartRoutes from './chart';
import healthRoutes from './health';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/stocks', stocksRoutes);
router.use('/trading', tradingRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/users', usersRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/teacher', teacherRoutes);
router.use('/real-stocks', realStockRoutes);
router.use('/admin', adminRoutes);
router.use('/stock-management', stockManagementRoutes);
router.use('/stock-data', stockDataRoutes);
router.use('/chart', chartRoutes);

export default router;