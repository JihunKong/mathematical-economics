import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { stockValidators } from '../utils/validators';
import { stockRateLimiter } from '../middleware/rateLimiter';
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
  stockRateLimiter,
  stockValidators.getBySymbol,
  validate,
  stockController.getStockPrice
);

router.get(
  '/:symbol/chart',
  stockRateLimiter,
  stockValidators.getBySymbol,
  validate,
  stockController.getStockChart
);

// 새로운 실시간 가격 조회 엔드포인트
router.get(
  '/:symbol/realtime',
  stockRateLimiter,
  stockValidators.getBySymbol,
  validate,
  stockController.getRealtimePrice
);

// 여러 종목 가격 일괄 조회
router.post(
  '/prices/multiple',
  stockRateLimiter,
  stockController.getMultiplePrices
);

// 과거 데이터 조회 (차트용)
router.get(
  '/:symbol/historical',
  stockRateLimiter,
  stockValidators.getBySymbol,
  validate,
  stockController.getHistoricalData
);

export default router;