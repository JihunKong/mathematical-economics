import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class WatchlistService {
  // Get available stocks for watchlist selection with pagination
  async getAvailableStocks(search?: string, market?: string, limit: number = 20, page: number = 1) {
    try {
      const where: any = {
        isActive: true
      };

      if (search) {
        where.OR = [
          { name: { contains: search } },
          { symbol: { contains: search } }
        ];
      }

      if (market && market !== 'ALL') {
        where.market = market;
      }

      // Get total count for pagination
      const total = await prisma.stock.count({ where });

      // Calculate offset
      const skip = (page - 1) * limit;

      const stocks = await prisma.stock.findMany({
        where,
        select: {
          id: true,
          symbol: true,
          name: true,
          market: true,
          sector: true,
          currentPrice: true,
          change: true,
          changePercent: true,
          lastPriceUpdate: true
        },
        orderBy: [
          { market: 'asc' },
          { name: 'asc' }
        ],
        skip,
        take: limit
      });

      return {
        stocks,
        total
      };
    } catch (error) {
      logger.error('Error getting available stocks:', error);
      throw new Error('Failed to get available stocks');
    }
  }

  // Get user's current watchlist
  async getUserWatchlist(userId: string) {
    try {
      const watchlist = await prisma.watchlist.findMany({
        where: { userId },
        include: {
          stock: {
            select: {
              id: true,
              symbol: true,
              name: true,
              market: true,
              sector: true,
              currentPrice: true,
              change: true,
              changePercent: true,
              lastPriceUpdate: true
            }
          }
        },
        orderBy: { order: 'asc' }
      });

      return watchlist;
    } catch (error) {
      logger.error('Error getting user watchlist:', error);
      throw new Error('Failed to get user watchlist');
    }
  }

  // Check if user can change watchlist (once per day limit)
  async canChangeWatchlist(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { lastWatchlistChange: true }
      });

      if (!user?.lastWatchlistChange) {
        return true; // First time setting watchlist
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastChange = new Date(user.lastWatchlistChange);
      lastChange.setHours(0, 0, 0, 0);

      return lastChange.getTime() < today.getTime();
    } catch (error) {
      logger.error('Error checking watchlist change permission:', error);
      return false;
    }
  }

  // Set user's watchlist (max 10 stocks)
  async setUserWatchlist(userId: string, stockIds: string[]) {
    try {
      // Validate input
      if (stockIds.length === 0 || stockIds.length > 10) {
        throw new Error('Watchlist must contain 1-10 stocks');
      }

      // Check if user can change watchlist
      const canChange = await this.canChangeWatchlist(userId);
      if (!canChange) {
        throw new Error('You can only change your watchlist once per day');
      }

      // Verify all stocks exist and are active
      const stocks = await prisma.stock.findMany({
        where: {
          id: { in: stockIds },
          isActive: true
        }
      });

      if (stocks.length !== stockIds.length) {
        throw new Error('Some selected stocks are not available');
      }

      // Use transaction for atomic operations
      const result = await prisma.$transaction(async (tx) => {
        // Remove existing watchlist
        await tx.watchlist.deleteMany({
          where: { userId }
        });

        // Add new watchlist items
        const watchlistItems = stockIds.map((stockId, index) => ({
          userId,
          stockId,
          order: index + 1
        }));

        await tx.watchlist.createMany({
          data: watchlistItems
        });

        // Update user's watchlist status and last change time
        await tx.user.update({
          where: { id: userId },
          data: {
            hasSelectedWatchlist: true,
            lastWatchlistChange: new Date()
          }
        });

        // Mark selected stocks as tracked for price updates
        await tx.stock.updateMany({
          where: { id: { in: stockIds } },
          data: { isTracked: true }
        });

        return watchlistItems.length;
      });

      logger.info(`User ${userId} updated watchlist with ${result} stocks`);
      return result;
    } catch (error) {
      logger.error('Error setting user watchlist:', error);
      throw error;
    }
  }

  // Add single stock to watchlist (if not full)
  async addToWatchlist(userId: string, stockId: string) {
    try {
      const currentWatchlist = await this.getUserWatchlist(userId);
      
      if (currentWatchlist.length >= 10) {
        throw new Error('Watchlist is full (maximum 10 stocks)');
      }

      // Check if stock already in watchlist
      const exists = currentWatchlist.some(item => item.stockId === stockId);
      if (exists) {
        throw new Error('Stock already in watchlist');
      }

      // Check if user can change watchlist
      const canChange = await this.canChangeWatchlist(userId);
      if (!canChange) {
        throw new Error('You can only change your watchlist once per day');
      }

      // Verify stock exists and is active
      const stock = await prisma.stock.findFirst({
        where: {
          id: stockId,
          isActive: true
        }
      });

      if (!stock) {
        throw new Error('Stock not found or not available');
      }

      // Add to watchlist
      const result = await prisma.$transaction(async (tx) => {
        const newOrder = currentWatchlist.length + 1;
        
        const watchlistItem = await tx.watchlist.create({
          data: {
            userId,
            stockId,
            order: newOrder
          },
          include: {
            stock: {
              select: {
                id: true,
                symbol: true,
                name: true,
                market: true,
                sector: true,
                currentPrice: true,
                change: true,
                changePercent: true,
                lastPriceUpdate: true
              }
            }
          }
        });

        // Update user's last change time
        await tx.user.update({
          where: { id: userId },
          data: {
            hasSelectedWatchlist: true,
            lastWatchlistChange: new Date()
          }
        });

        // Mark stock as tracked
        await tx.stock.update({
          where: { id: stockId },
          data: { isTracked: true }
        });

        return watchlistItem;
      });

      logger.info(`User ${userId} added stock ${stockId} to watchlist`);
      return result;
    } catch (error) {
      logger.error('Error adding to watchlist:', error);
      throw error;
    }
  }

  // Remove stock from watchlist
  async removeFromWatchlist(userId: string, stockId: string) {
    try {
      // Check if user can change watchlist
      const canChange = await this.canChangeWatchlist(userId);
      if (!canChange) {
        throw new Error('You can only change your watchlist once per day');
      }

      const result = await prisma.$transaction(async (tx) => {
        // Find and remove the watchlist item
        const removed = await tx.watchlist.deleteMany({
          where: {
            userId,
            stockId
          }
        });

        if (removed.count === 0) {
          throw new Error('Stock not found in watchlist');
        }

        // Reorder remaining items
        const remaining = await tx.watchlist.findMany({
          where: { userId },
          orderBy: { order: 'asc' }
        });

        // Update orders
        for (let i = 0; i < remaining.length; i++) {
          await tx.watchlist.update({
            where: { id: remaining[i].id },
            data: { order: i + 1 }
          });
        }

        // Update user's last change time
        await tx.user.update({
          where: { id: userId },
          data: {
            lastWatchlistChange: new Date()
          }
        });

        // Check if stock should still be tracked
        const stillWatched = await tx.watchlist.findFirst({
          where: { stockId }
        });

        if (!stillWatched) {
          await tx.stock.update({
            where: { id: stockId },
            data: { isTracked: false }
          });
        }

        return removed.count;
      });

      logger.info(`User ${userId} removed stock ${stockId} from watchlist`);
      return result;
    } catch (error) {
      logger.error('Error removing from watchlist:', error);
      throw error;
    }
  }

  // Get all tracked stocks (for price collector)
  async getTrackedStocks() {
    try {
      const stocks = await prisma.stock.findMany({
        where: {
          isTracked: true,
          isActive: true
        },
        select: {
          id: true,
          symbol: true,
          name: true,
          market: true,
          lastPriceUpdate: true
        }
      });

      return stocks;
    } catch (error) {
      logger.error('Error getting tracked stocks:', error);
      throw new Error('Failed to get tracked stocks');
    }
  }

  // Check if stock price is fresh (within 24 hours)
  isPriceFresh(lastUpdate: Date | null): boolean {
    if (!lastUpdate) return false;
    
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return lastUpdate > dayAgo;
  }

  // Get market statistics
  async getMarketStats() {
    try {
      const stats = await prisma.stock.groupBy({
        by: ['market'],
        where: { isActive: true },
        _count: { market: true }
      });

      const totalStocks = await prisma.stock.count({
        where: { isActive: true }
      });

      const trackedStocks = await prisma.stock.count({
        where: { 
          isTracked: true,
          isActive: true 
        }
      });

      return {
        totalStocks,
        trackedStocks,
        byMarket: stats.map(stat => ({
          market: stat.market,
          count: stat._count.market
        }))
      };
    } catch (error) {
      logger.error('Error getting market stats:', error);
      throw new Error('Failed to get market statistics');
    }
  }

  // Preset: Get top 10 stocks by market cap
  async getTop10Stocks() {
    try {
      // Get top 10 stocks by market cap (simplified - in real app, you'd have market cap data)
      // For now, we'll get popular KOSPI stocks
      const stocks = await prisma.stock.findMany({
        where: {
          market: 'KOSPI',
          symbol: {
            in: [
              '005930', // Samsung Electronics
              '000660', // SK Hynix
              '373220', // LG Energy Solution
              '207940', // Samsung Biologics
              '005935', // Samsung Electronics (preferred)
              '005490', // POSCO
              '006400', // Samsung SDI
              '051910', // LG Chem
              '035420', // NAVER
              '000270'  // Kia
            ]
          }
        },
        select: {
          id: true,
          symbol: true,
          name: true,
          market: true,
          sector: true,
          currentPrice: true,
          change: true,
          changePercent: true,
          lastPriceUpdate: true
        }
      });

      return this.transformStockData(stocks);
    } catch (error) {
      logger.error('Error getting top 10 stocks:', error);
      throw error;
    }
  }

  // Preset: Get random stocks
  async getRandomStocks(count: number = 10) {
    try {
      // Get total count
      const totalCount = await prisma.stock.count({
        where: { isActive: true }
      });
      
      // Generate random indices
      const randomIndices = new Set<number>();
      while (randomIndices.size < Math.min(count, totalCount)) {
        randomIndices.add(Math.floor(Math.random() * totalCount));
      }

      // Get stocks at random indices
      const stocks = await prisma.stock.findMany({
        where: { isActive: true },
        skip: 0,
        take: totalCount,
        select: {
          id: true,
          symbol: true,
          name: true,
          market: true,
          sector: true,
          currentPrice: true,
          change: true,
          changePercent: true,
          lastPriceUpdate: true
        }
      });

      // Select random stocks
      const selectedStocks = Array.from(randomIndices).map(index => stocks[index]).filter(Boolean);

      return this.transformStockData(selectedStocks.slice(0, count));
    } catch (error) {
      logger.error('Error getting random stocks:', error);
      throw error;
    }
  }

  // Preset: Get KOSPI leader stocks
  async getKospiLeaders() {
    try {
      // Get major KOSPI companies by sector
      const stocks = await prisma.stock.findMany({
        where: {
          market: 'KOSPI',
          OR: [
            { sector: '전기전자' },
            { sector: '금융업' },
            { sector: '화학' },
            { sector: '운수장비' }
          ]
        },
        select: {
          id: true,
          symbol: true,
          name: true,
          market: true,
          sector: true,
          currentPrice: true,
          change: true,
          changePercent: true,
          lastPriceUpdate: true
        },
        take: 10,
        orderBy: {
          name: 'asc'
        }
      });

      return this.transformStockData(stocks);
    } catch (error) {
      logger.error('Error getting KOSPI leaders:', error);
      throw error;
    }
  }

  // Preset: Get KOSDAQ promising stocks
  async getKosdaqPromising() {
    try {
      // Get KOSDAQ stocks with good performance (simplified)
      const stocks = await prisma.stock.findMany({
        where: {
          market: 'KOSDAQ',
          OR: [
            { sector: '제약' },
            { sector: '소프트웨어' },
            { sector: '게임' },
            { sector: '바이오' }
          ]
        },
        select: {
          id: true,
          symbol: true,
          name: true,
          market: true,
          sector: true,
          currentPrice: true,
          change: true,
          changePercent: true,
          lastPriceUpdate: true
        },
        take: 10,
        orderBy: {
          name: 'asc'
        }
      });

      return this.transformStockData(stocks);
    } catch (error) {
      logger.error('Error getting KOSDAQ promising stocks:', error);
      throw error;
    }
  }

  // Transform stock data with latest price
  private transformStockData(stocks: any[]) {
    return stocks.map(stock => ({
      id: stock.id,
      symbol: stock.symbol,
      name: stock.name,
      market: stock.market,
      sector: stock.sector,
      currentPrice: stock.currentPrice || 0,
      change: stock.change || 0,
      changePercent: stock.changePercent || 0,
      lastPriceUpdate: stock.lastPriceUpdate
    }));
  }
}

export const watchlistService = new WatchlistService();