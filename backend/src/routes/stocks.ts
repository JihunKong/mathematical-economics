import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { stockValidators } from '../utils/validators';
import { smartRateLimiter } from '../middleware/smartRateLimiter';
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
  smartRateLimiter,
  stockValidators.getBySymbol,
  validate,
  stockController.getStockPrice
);

router.get(
  '/:symbol/chart',
  smartRateLimiter,
  stockValidators.getBySymbol,
  validate,
  stockController.getStockChart
);

// 새로운 실시간 가격 조회 엔드포인트
router.get(
  '/:symbol/realtime',
  smartRateLimiter,
  stockValidators.getBySymbol,
  validate,
  stockController.getRealtimePrice
);

// 여러 종목 가격 일괄 조회
router.post(
  '/prices/multiple',
  smartRateLimiter,
  stockController.getMultiplePrices
);

// 과거 데이터 조회 (차트용)
router.get(
  '/:symbol/historical',
  smartRateLimiter,
  stockValidators.getBySymbol,
  validate,
  stockController.getHistoricalData
);

export default router;