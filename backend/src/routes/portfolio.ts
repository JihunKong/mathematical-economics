import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as portfolioController from '../controllers/portfolioController';

const router = Router();

// All portfolio routes require authentication
router.use(authenticate);

router.get('/', portfolioController.getPortfolio);
router.get('/holdings', portfolioController.getHoldings);
router.get('/performance', portfolioController.getPortfolioPerformance);
router.get('/value-history', portfolioController.getValueHistory);

export default router;