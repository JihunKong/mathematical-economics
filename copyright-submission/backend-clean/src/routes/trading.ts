import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { tradingValidators } from '../utils/validators';
import { tradingRateLimiter } from '../middleware/rateLimiter';
import { requireWatchlist, requireFreshPrice } from '../middleware/watchlistGuard';
import * as tradingController from '../controllers/tradingController'에러가 발생했습니다'/buy'에러가 발생했습니다'/sell'에러가 발생했습니다'/history', tradingController.getTransactionHistory);

export default router;