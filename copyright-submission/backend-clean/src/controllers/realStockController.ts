import { Request, Response } from 'express';
import { RealStockService } from '../services/realStockService';
import { catchAsync } from '../utils/catchAsync';
import { cacheService, CACHE_TTL, cacheKeys } from '../services/cacheService'에러가 발생했습니다'X-Cache-Hit', 'true'에러가 발생했습니다'1month'에러가 발생했습니다'X-Cache-Hit', 'true'에러가 발생했습니다'day'에러가 발생했습니다'day' | 'week' | 'month' | '3month' | 'year'에러가 발생했습니다'KOSPI' } = req.query;
  
  const stocks = await realStockService.getPopularStocks(market as 'KOSPI' | 'KOSDAQ'에러가 발생했습니다'symbols array is required'에러가 발생했습니다'../config/database'에러가 발생했습니다'No active stocks found',
      data: { succeeded: 0, failed: 0 }
    });
  }
  
  const result = await realStockService.updateMultipleStockPrices(symbols);
  
  return res.json({
    success: true,
    message: `Updated ${result.succeeded} stocks successfully, ${result.failed} failed`,
    data: result
  });
});