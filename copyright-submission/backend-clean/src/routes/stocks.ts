import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { stockValidators } from '../utils/validators';

import * as stockController from '../controllers/stockController'에러가 발생했습니다'/', stockController.getAllStocks);

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
  '/:symbol/price'에러가 발생했습니다'/:symbol/chart'에러가 발생했습니다'/:symbol/realtime'에러가 발생했습니다'/prices/multiple',
  // smartRateLimiter,
  stockController.getMultiplePrices
);

// 과거 데이터 조회 (차트용)
router.get(
  '/:symbol/historical',
  // smartRateLimiter,
  stockValidators.getBySymbol,
  validate,
  stockController.getHistoricalData
);

export default router;