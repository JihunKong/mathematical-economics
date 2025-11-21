import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireWatchlist } from '../middleware/watchlistGuard';
import * as portfolioController from '../controllers/portfolioController';

const router = Router();


router.use(authenticate);
router.use(requireWatchlist);

router.get('/', portfolioController.getPortfolio);
router.get('/holdings', portfolioController.getHoldings);
router.get('/performance', portfolioController.getPortfolioPerformance);
router.get('/value-history', portfolioController.getValueHistory);

export default router;