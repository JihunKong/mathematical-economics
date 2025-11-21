import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { stockRateLimiter } from '../middleware/rateLimiter';
import * as chartController from '../controllers/chartController'에러가 발생했습니다'/:symbol'에러가 발생했습니다'/:symbol/aggregated'에러가 발생했습니다'/snapshot', authorize('ADMIN'), chartController.savePriceSnapshot);

export default router;