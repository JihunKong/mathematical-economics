import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { stockRateLimiter } from '../middleware/rateLimiter';
import * as chartController from '../controllers/chartController';

const router = Router();

// Public routes (require authentication only)
router.use(authenticate);

// Get chart data for a stock
router.get('/:symbol', stockRateLimiter, chartController.getStockChartData);

// Get aggregated chart data (for large datasets)
router.get('/:symbol/aggregated', stockRateLimiter, chartController.getAggregatedChartData);

// Admin only - save price snapshot
router.post('/snapshot', authorize('ADMIN'), chartController.savePriceSnapshot);

export default router;