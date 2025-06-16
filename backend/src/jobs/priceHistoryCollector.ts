import cron from 'node-cron';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export class PriceHistoryCollector {
  private cronJob: cron.ScheduledTask | null = null;

  start() {
    // Run every 5 minutes during market hours (9:00 AM - 3:30 PM KST)
    this.cronJob = cron.schedule('*/5 9-15 * * 1-5', async () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // Skip if after 3:30 PM
      if (hours === 15 && minutes > 30) {
        return;
      }
      
      await this.collectPriceHistory();
    }, {
      timezone: 'Asia/Seoul'
    });

    // Also run once at market close (3:30 PM KST)
    cron.schedule('30 15 * * 1-5', async () => {
      await this.collectPriceHistory();
    }, {
      timezone: 'Asia/Seoul'
    });

    logger.info('Price history collector started');
  }

  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      logger.info('Price history collector stopped');
    }
  }

  async collectPriceHistory() {
    try {
      logger.info('Starting price history collection...');
      
      // Get all tracked stocks
      const trackedStocks = await prisma.stock.findMany({
        where: { isTracked: true }
      });

      let savedCount = 0;
      let errorCount = 0;

      for (const stock of trackedStocks) {
        try {
          // Check if we already have a recent entry (within last 5 minutes)
          const recentEntry = await prisma.stockPriceHistory.findFirst({
            where: {
              stockId: stock.id,
              timestamp: {
                gte: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
              }
            }
          });

          if (recentEntry) {
            logger.debug(`Skipping ${stock.symbol} - recent entry exists`);
            continue;
          }

          // Save price history
          await prisma.stockPriceHistory.create({
            data: {
              stockId: stock.id,
              currentPrice: stock.currentPrice,
              previousClose: stock.previousClose,
              dayOpen: stock.dayOpen,
              dayHigh: stock.dayHigh,
              dayLow: stock.dayLow,
              volume: stock.volume,
              change: stock.change,
              changePercent: stock.changePercent,
              timestamp: new Date()
            }
          });
          
          savedCount++;
          logger.debug(`Saved price history for ${stock.symbol}`);
        } catch (error) {
          errorCount++;
          logger.error(`Error saving price history for ${stock.symbol}:`, error);
        }
      }

      logger.info(`Price history collection completed. Saved: ${savedCount}, Errors: ${errorCount}`);
      
      // Clean up old data (keep only last 6 months)
      await this.cleanupOldData();
      
    } catch (error) {
      logger.error('Error in price history collection:', error);
    }
  }

  async cleanupOldData() {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const result = await prisma.stockPriceHistory.deleteMany({
        where: {
          timestamp: {
            lt: sixMonthsAgo
          }
        }
      });

      if (result.count > 0) {
        logger.info(`Cleaned up ${result.count} old price history records`);
      }
    } catch (error) {
      logger.error('Error cleaning up old price history:', error);
    }
  }

  // Manual collection method
  async collectNow() {
    await this.collectPriceHistory();
  }
}

// Singleton instance
let collectorInstance: PriceHistoryCollector | null = null;

export function getPriceHistoryCollector(): PriceHistoryCollector {
  if (!collectorInstance) {
    collectorInstance = new PriceHistoryCollector();
  }
  return collectorInstance;
}