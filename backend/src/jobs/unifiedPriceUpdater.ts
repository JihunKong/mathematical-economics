import * as cron from 'node-cron';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { StockDataService } from '../services/stockDataService';

const stockDataService = new StockDataService();

class UnifiedPriceUpdater {
  private priceUpdateJob: cron.ScheduledTask | null = null;
  private cleanupJob: cron.ScheduledTask | null = null;

  /**
   * Start the unified price updater
   * - During market hours (Mon-Fri 09:00-15:30): Every 15 minutes
   * - Only updates stocks in student watchlists (max ~50 stocks for 5 users)
   * - Daily cleanup at midnight (removes price history older than 3 days)
   */
  start() {
    logger.info('Starting unified price updater...');

    // Price update job: Every 15 minutes during market hours (Mon-Fri 09:00-15:30 KST)
    // Cron format: minute hour * * day-of-week
    // */15 9-15 * * 1-5 = Every 15 minutes from 9 AM to 3 PM on weekdays
    this.priceUpdateJob = cron.schedule(
      '*/15 9-15 * * 1-5',
      async () => {
        try {
          await this.updateWatchlistedStockPrices();
        } catch (error) {
          logger.error('Error in price update job:', error);
        }
      },
      {
        scheduled: true,
        timezone: 'Asia/Seoul'
      }
    );

    // Cleanup job: Daily at midnight (00:00 KST)
    this.cleanupJob = cron.schedule(
      '0 0 * * *',
      async () => {
        try {
          await this.cleanupOldPriceHistory();
        } catch (error) {
          logger.error('Error in cleanup job:', error);
        }
      },
      {
        scheduled: true,
        timezone: 'Asia/Seoul'
      }
    );

    logger.info('✅ Unified price updater started successfully');
    logger.info('  📊 Price updates: Every 15 min during market hours (Mon-Fri 09:00-15:30)');
    logger.info('  🧹 Cleanup: Daily at midnight (removes data older than 3 days)');
  }

  /**
   * Stop all cron jobs
   */
  stop() {
    if (this.priceUpdateJob) {
      this.priceUpdateJob.stop();
      logger.info('Stopped price update job');
    }

    if (this.cleanupJob) {
      this.cleanupJob.stop();
      logger.info('Stopped cleanup job');
    }
  }

  /**
   * Update prices only for stocks in watchlists
   * This is much more efficient than updating all stocks
   */
  private async updateWatchlistedStockPrices() {
    const startTime = Date.now();
    logger.info('Starting watchlist price update...');

    try {
      // Get all unique stocks from watchlists
      const watchlistStocks = await prisma.watchlist.findMany({
        include: {
          stock: true
        },
        distinct: ['stockId']
      });

      if (watchlistStocks.length === 0) {
        logger.info('No stocks in watchlists, skipping update');
        return;
      }

      logger.info(`Found ${watchlistStocks.length} unique stocks in watchlists`);

      const batchSize = 10;
      const delay = 2000; // 2 seconds between batches
      let updated = 0;
      let failed = 0;

      // Process in batches to avoid rate limiting
      for (let i = 0; i < watchlistStocks.length; i += batchSize) {
        const batch = watchlistStocks.slice(i, i + batchSize);

        // Process batch in parallel
        const results = await Promise.allSettled(
          batch.map(async (item) => {
            try {
              const stockData = await stockDataService.getStockPrice(item.stock.symbol);

              if (stockData) {
                // Update stock price
                await prisma.stock.update({
                  where: { id: item.stockId },
                  data: {
                    currentPrice: stockData.currentPrice,
                    previousClose: stockData.previousClose || stockData.currentPrice,
                    dayOpen: stockData.dayOpen,
                    dayHigh: stockData.dayHigh,
                    dayLow: stockData.dayLow,
                    volume: stockData.volume,
                    change: stockData.change,
                    changePercent: stockData.changePercent,
                    lastPriceUpdate: new Date()
                  }
                });

                // Save to price history
                await prisma.stockPriceHistory.create({
                  data: {
                    stockId: item.stockId,
                    symbol: item.stock.symbol,
                    currentPrice: stockData.currentPrice,
                    previousClose: stockData.previousClose || stockData.currentPrice,
                    dayOpen: stockData.dayOpen || stockData.currentPrice,
                    dayHigh: stockData.dayHigh || stockData.currentPrice,
                    dayLow: stockData.dayLow || stockData.currentPrice,
                    volume: stockData.volume || BigInt(0),
                    change: stockData.change || 0,
                    changePercent: stockData.changePercent || 0,
                    timestamp: new Date()
                  }
                });

                logger.debug(`Updated ${item.stock.symbol}: ${stockData.currentPrice}`);
                return { success: true, symbol: item.stock.symbol };
              } else {
                logger.warn(`No data available for ${item.stock.symbol}`);
                return { success: false, symbol: item.stock.symbol };
              }
            } catch (error) {
              logger.error(`Failed to update ${item.stock.symbol}:`, error);
              return { success: false, symbol: item.stock.symbol };
            }
          })
        );

        // Count results
        results.forEach((result) => {
          if (result.status === 'fulfilled' && result.value.success) {
            updated++;
          } else {
            failed++;
          }
        });

        // Delay between batches (except for last batch)
        if (i + batchSize < watchlistStocks.length) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      const duration = Date.now() - startTime;
      logger.info(
        `✅ Price update completed in ${duration}ms: ${updated} updated, ${failed} failed`
      );
    } catch (error) {
      logger.error('Fatal error in watchlist price update:', error);
    }
  }

  /**
   * Clean up old price history to save database space
   * Removes records older than 3 days (optimized for t3.small)
   */
  private async cleanupOldPriceHistory() {
    logger.info('Starting price history cleanup...');

    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const deletedCount = await prisma.stockPriceHistory.deleteMany({
        where: {
          timestamp: {
            lt: threeDaysAgo
          }
        }
      });

      logger.info(`🧹 Cleaned up ${deletedCount.count} old price history records (older than 3 days)`);

      // Also clean up old daily price history
      const deletedDailyCount = await prisma.priceHistory.deleteMany({
        where: {
          date: {
            lt: threeDaysAgo
          }
        }
      });

      logger.info(`🧹 Cleaned up ${deletedDailyCount.count} old daily price records`);
    } catch (error) {
      logger.error('Error cleaning up price history:', error);
    }
  }

  /**
   * Manual trigger for price update (useful for testing or manual refresh)
   */
  async triggerManualUpdate() {
    logger.info('Manual price update triggered');
    await this.updateWatchlistedStockPrices();
  }
}

// Export singleton instance
export const unifiedPriceUpdater = new UnifiedPriceUpdater();
