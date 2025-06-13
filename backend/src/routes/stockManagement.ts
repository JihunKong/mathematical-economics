import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as stockManagementController from '../controllers/stockManagementController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Public routes (all authenticated users)
router.get('/search', stockManagementController.searchStocks);
router.get('/tracked', stockManagementController.getTrackedStocks);
router.get('/:symbol/history', stockManagementController.getStockPriceHistory);

// Teacher/Admin only routes
router.use(authorize('TEACHER', 'ADMIN'));
router.post('/add', stockManagementController.addStock);
router.patch('/:symbol/tracking', stockManagementController.toggleStockTracking);
router.post('/collect-prices', stockManagementController.triggerPriceCollection);
router.put('/:symbol/price', stockManagementController.updateStockPrice);
router.post('/crawl-prices', stockManagementController.crawlStockPrices);

export default router;