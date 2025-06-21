import { Router } from 'express';
import { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { watchlistService } from '../services/watchlistService';
import { logger } from '../utils/logger';
import Joi from 'joi';

const router = Router();

// Validation schemas
const setWatchlistSchema = Joi.object({
  stockIds: Joi.array().items(Joi.string().required()).min(1).max(10).required()
});

const addStockSchema = Joi.object({
  stockId: Joi.string().required()
});

const getStocksSchema = Joi.object({
  search: Joi.string().allow('').optional(),
  market: Joi.string().valid('KOSPI', 'KOSDAQ', 'KOSDAQ GLOBAL', 'KONEX', 'ALL').optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  page: Joi.number().integer().min(1).optional()
});

// Get available stocks for selection
router.get('/stocks', authenticate, async (req: Request, res: Response) => {
  try {
    // Convert query parameters to appropriate types
    const queryParams = {
      search: req.query.search as string,
      market: req.query.market as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined
    };

    const { error, value } = getStocksSchema.validate(queryParams);
    if (error) {
      logger.error('Watchlist stocks validation error:', error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { search, market, limit = 20, page = 1 } = value;
    const result = await watchlistService.getAvailableStocks(search, market, limit, page);

    return res.json({
      success: true,
      data: result.stocks,
      total: result.total,
      page: page,
      limit: limit
    });
  } catch (error) {
    logger.error('Error getting available stocks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get available stocks'
    });
  }
});

// Get user's current watchlist
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const watchlist = await watchlistService.getUserWatchlist(userId);

    return res.json({
      success: true,
      data: watchlist
    });
  } catch (error) {
    logger.error('Error getting user watchlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get watchlist'
    });
  }
});

// Check if user can change watchlist today
router.get('/can-change', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const canChange = await watchlistService.canChangeWatchlist(userId);

    return res.json({
      success: true,
      data: { canChange }
    });
  } catch (error) {
    logger.error('Error checking watchlist change permission:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check permissions'
    });
  }
});

// Set complete watchlist (replace existing)
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { error, value } = setWatchlistSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const userId = req.user?.id;
    const { stockIds } = value;

    const result = await watchlistService.setUserWatchlist(userId, stockIds);

    return res.json({
      success: true,
      message: `Watchlist updated with ${result} stocks`,
      data: { count: result }
    });
  } catch (error) {
    logger.error('Error setting watchlist:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update watchlist'
    });
  }
});

// Add single stock to watchlist
router.post('/add', authenticate, async (req: Request, res: Response) => {
  try {
    const { error, value } = addStockSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const userId = req.user?.id;
    const { stockId } = value;

    const result = await watchlistService.addToWatchlist(userId, stockId);

    return res.json({
      success: true,
      message: 'Stock added to watchlist',
      data: result
    });
  } catch (error) {
    logger.error('Error adding to watchlist:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to add stock to watchlist'
    });
  }
});

// Remove stock from watchlist
router.delete('/:stockId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { stockId } = req.params;

    if (!stockId) {
      return res.status(400).json({
        success: false,
        message: 'Stock ID is required'
      });
    }

    const result = await watchlistService.removeFromWatchlist(userId, stockId);

    return res.json({
      success: true,
      message: 'Stock removed from watchlist',
      data: { removed: result }
    });
  } catch (error) {
    logger.error('Error removing from watchlist:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to remove stock from watchlist'
    });
  }
});

// Get market statistics
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const stats = await watchlistService.getMarketStats();

    return res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting market stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get market statistics'
    });
  }
});

// Preset: Top 10 stocks by market cap
router.get('/presets/top10', authenticate, async (req: Request, res: Response) => {
  try {
    const stocks = await watchlistService.getTop10Stocks();
    
    return res.json({
      success: true,
      data: stocks
    });
  } catch (error) {
    logger.error('Error getting top 10 stocks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get top 10 stocks'
    });
  }
});

// Preset: Random 10 stocks
router.get('/presets/random', authenticate, async (req: Request, res: Response) => {
  try {
    const stocks = await watchlistService.getRandomStocks(10);
    
    return res.json({
      success: true,
      data: stocks
    });
  } catch (error) {
    logger.error('Error getting random stocks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get random stocks'
    });
  }
});

// Preset: KOSPI leaders
router.get('/presets/kospi-leaders', authenticate, async (req: Request, res: Response) => {
  try {
    const stocks = await watchlistService.getKospiLeaders();
    
    return res.json({
      success: true,
      data: stocks
    });
  } catch (error) {
    logger.error('Error getting KOSPI leaders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get KOSPI leaders'
    });
  }
});

// Preset: KOSDAQ promising stocks
router.get('/presets/kosdaq-promising', authenticate, async (req: Request, res: Response) => {
  try {
    const stocks = await watchlistService.getKosdaqPromising();
    
    return res.json({
      success: true,
      data: stocks
    });
  } catch (error) {
    logger.error('Error getting KOSDAQ promising stocks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get KOSDAQ promising stocks'
    });
  }
});

export default router;