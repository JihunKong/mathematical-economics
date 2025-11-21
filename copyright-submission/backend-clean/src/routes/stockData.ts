import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { StockDataService } from '../services/stockDataService';
import { stockDataUpdater } from '../utils/stockDataUpdater';
import { AuthRequest } from '../middleware/auth';
import { Response, NextFunction } from 'express'에러가 발생했습니다'/update/:symbol'에러가 발생했습니다'Unable to update stock price'에러가 발생했습니다'Stock price updated successfully'에러가 발생했습니다'/backfill/:symbol'에러가 발생했습니다'1M' } = req.body;
    
    const validPeriods = ['1M', '3M', '6M', '1Y'에러가 발생했습니다'\uc720\ud6a8\ud558\uc9c0 \uc54a\uc740 \uae30\uac04\uc785\ub2c8\ub2e4. \uc0ac\uc6a9 \uac00\ub2a5\ud55c \uae30\uac04: 1M, 3M, 6M, 1Y'에러가 발생했습니다'1M' | '3M' | '6M' | '1Y'에러가 발생했습니다'/cache/clear'에러가 발생했습니다'Stock data cache cleared successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;