import { Router } from 'express';
import { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
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
  search: Joi.string().optional(),
  market: Joi.string().valid('KOSPI', 'KOSDAQ', 'KOSDAQ GLOBAL', 'ALL').optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

// Get available stocks for selection
router.get('/stocks', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { error, value } = getStocksSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { search, market, limit = 50 } = value;
    const stocks = await watchlistService.getAvailableStocks(search, market, limit);

    res.json({
      success: true,
      data: stocks
    });
  } catch (error) {
    logger.error('Error getting available stocks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available stocks'
    });
  }
});

// Get user's current watchlist
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const watchlist = await watchlistService.getUserWatchlist(userId);

    res.json({
      success: true,
      data: watchlist
    });
  } catch (error) {
    logger.error('Error getting user watchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get watchlist'
    });
  }
});

// Check if user can change watchlist today
router.get('/can-change', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const canChange = await watchlistService.canChangeWatchlist(userId);

    res.json({
      success: true,
      data: { canChange }
    });
  } catch (error) {
    logger.error('Error checking watchlist change permission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check permissions'
    });
  }
});

// Set complete watchlist (replace existing)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
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

    res.json({
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

    res.status(500).json({
      success: false,
      message: 'Failed to update watchlist'
    });
  }
});

// Add single stock to watchlist
router.post('/add', authenticateToken, async (req: Request, res: Response) => {
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

    res.json({
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

    res.status(500).json({
      success: false,
      message: 'Failed to add stock to watchlist'
    });
  }
});

// Remove stock from watchlist
router.delete('/:stockId', authenticateToken, async (req: Request, res: Response) => {
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

    res.json({
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

    res.status(500).json({
      success: false,
      message: 'Failed to remove stock from watchlist'
    });
  }
});

// Get market statistics
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const stats = await watchlistService.getMarketStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting market stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get market statistics'
    });
  }
});

export default router;