import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { tradingValidators } from '../utils/validators';
import { tradingRateLimiter } from '../middleware/rateLimiter';
import * as tradingController from '../controllers/tradingController';

const router = Router();

// All trading routes require authentication
router.use(authenticate);

router.post(
  '/buy',
  tradingRateLimiter,
  tradingValidators.buy,
  validate,
  tradingController.buyStock
);

router.post(
  '/sell',
  tradingRateLimiter,
  tradingValidators.sell,
  validate,
  tradingController.sellStock
);

router.get('/history', tradingController.getTransactionHistory);

export default router;