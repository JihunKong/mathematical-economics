import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { tradingValidators } from '../utils/validators';
import { tradingRateLimiter } from '../middleware/rateLimiter';
import { requireWatchlist, requireFreshPrice } from '../middleware/watchlistGuard';
import * as tradingController from '../controllers/tradingController';

const router = Router();

// All trading routes require authentication
router.use(authenticate);

router.post(
  '/buy',
  tradingRateLimiter,
  requireWatchlist,
  requireFreshPrice,
  tradingValidators.buy,
  validate,
  tradingController.buyStock
);

router.post(
  '/sell',
  tradingRateLimiter,
  requireWatchlist,
  requireFreshPrice,
  tradingValidators.sell,
  validate,
  tradingController.sellStock
);

router.get('/history', tradingController.getTransactionHistory);

export default router;