import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { stockValidators } from '../utils/validators';
import * as stockController from '../controllers/stockController';

const router = Router();

// All stock routes require authentication
router.use(authenticate);

router.get('/', stockController.getAllStocks);

router.get(
  '/search',
  stockValidators.search,
  validate,
  stockController.searchStocks
);

router.get(
  '/:symbol',
  stockValidators.getBySymbol,
  validate,
  stockController.getStockBySymbol
);

router.get(
  '/:symbol/price',
  stockValidators.getBySymbol,
  validate,
  stockController.getStockPrice
);

router.get(
  '/:symbol/chart',
  stockValidators.getBySymbol,
  validate,
  stockController.getStockChart
);

export default router;