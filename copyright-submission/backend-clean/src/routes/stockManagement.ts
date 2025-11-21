import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as stockManagementController from '../controllers/stockManagementController'에러가 발생했습니다'/search', stockManagementController.searchStocks);
router.get('/tracked', stockManagementController.getTrackedStocks);
router.get('/:symbol/history'에러가 발생했습니다'TEACHER', 'ADMIN'));
router.post('/add', stockManagementController.addStock);
router.patch('/:symbol/tracking', stockManagementController.toggleStockTracking);
router.post('/collect-prices', stockManagementController.triggerPriceCollection);
router.put('/:symbol/price', stockManagementController.updateStockPrice);
router.post('/crawl-prices', stockManagementController.crawlStockPrices);

export default router;