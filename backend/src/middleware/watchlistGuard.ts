import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

// Middleware to check if student has selected watchlist
export const requireWatchlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Skip check for non-students (teachers, admins)
    if (userRole !== 'STUDENT') {
      return next();
    }

    // Check if student has selected watchlist
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        hasSelectedWatchlist: true,
        role: true 
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.hasSelectedWatchlist) {
      return res.status(403).json({
        success: false,
        message: 'You must select your watchlist before accessing this feature',
        code: 'WATCHLIST_REQUIRED'
      });
    }

    return next();
  } catch (error) {
    logger.error('Error in watchlist guard middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Check if stock price is fresh (within 24 hours) before trading
export const requireFreshPrice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stockId } = req.body;

    if (!stockId) {
      return res.status(400).json({
        success: false,
        message: 'Stock ID is required'
      });
    }

    const stock = await prisma.stock.findUnique({
      where: { id: stockId },
      select: { 
        lastPriceUpdate: true,
        symbol: true,
        name: true 
      }
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }

    // Check if price is fresh (within 24 hours)
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (!stock.lastPriceUpdate || stock.lastPriceUpdate < dayAgo) {
      return res.status(423).json({
        success: false,
        message: `Stock price for ${stock.name} (${stock.symbol}) is not fresh. Please wait for price update.`,
        code: 'PRICE_NOT_FRESH',
        data: {
          stockId,
          symbol: stock.symbol,
          name: stock.name,
          lastUpdate: stock.lastPriceUpdate
        }
      });
    }

    return next();
  } catch (error) {
    logger.error('Error in fresh price middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};