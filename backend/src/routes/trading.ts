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
  (req, res, next) => {
    console.log('=== BUY ROUTE START ===');
    console.log('User:', req.user?.id, req.user?.role);
    console.log('Body:', req.body);
    next();
  },
  tradingRateLimiter,
  (req, res, next) => {
    console.log('=== AFTER RATE LIMITER ===');
    next();
  },
  requireWatchlist,
  (req, res, next) => {
    console.log('=== AFTER WATCHLIST CHECK ===');
    next();
  },
  requireFreshPrice,
  (req, res, next) => {
    console.log('=== AFTER FRESH PRICE CHECK ===');
    next();
  },
  tradingValidators.buy,
  validate,
  (req, res, next) => {
    console.log('=== BEFORE CONTROLLER ===');
    next();
  },
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