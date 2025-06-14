import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { StockDataService } from '../services/stockDataService';
import { stockDataUpdater } from '../utils/stockDataUpdater';
import { AuthRequest } from '../middleware/auth';
import { Response, NextFunction } from 'express';

const router = Router();
const stockDataService = new StockDataService();

// All routes require authentication
router.use(authenticate);

// Test endpoint to manually trigger stock price update
router.post('/update/:symbol', async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { symbol } = req.params;
    
    const priceData = await stockDataUpdater.updateSingleStock(symbol);
    
    if (!priceData) {
      res.status(404).json({
        success: false,
        message: 'Unable to update stock price',
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Stock price updated successfully',
      data: priceData,
    });
  } catch (error) {
    next(error);
  }
});

// Backfill historical data for a symbol
router.post('/backfill/:symbol', async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { symbol } = req.params;
    const { period = '1M' } = req.body;
    
    const validPeriods = ['1M', '3M', '6M', '1Y'];
    if (!validPeriods.includes(period)) {
      res.status(400).json({
        success: false,
        message: 'Invalid period. Valid periods are: 1M, 3M, 6M, 1Y',
      });
      return;
    }
    
    const historicalData = await stockDataUpdater.backfillHistoricalData(
      symbol,
      period as '1M' | '3M' | '6M' | '1Y'
    );
    
    res.status(200).json({
      success: true,
      message: `Backfilled ${historicalData.length} data points for ${symbol}`,
      data: historicalData,
    });
  } catch (error) {
    next(error);
  }
});

// Clear cache
router.post('/cache/clear', async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    stockDataService.clearCache();
    
    res.status(200).json({
      success: true,
      message: 'Stock data cache cleared successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;