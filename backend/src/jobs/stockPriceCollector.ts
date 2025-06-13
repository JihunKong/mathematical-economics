import cron from 'node-cron';
import { prisma } from '../config/database';
import { AggregatedStockService } from '../services/aggregatedStockService';
import { logger } from '../utils/logger';

export class StockPriceCollector {
  private aggregatedService: AggregatedStockService;
  private isRunning: boolean = false;
  private batchSize: number = 5; // Process 5 stocks at a time
  private delayBetweenBatches: number = 2000; // 2 seconds between batches

  constructor() {
    this.aggregatedService = new AggregatedStockService();
  }

  // Start the price collection job
  startCollector() {
    // Run every minute (with 5 second offset to avoid exact minute boundaries)
    cron.schedule('5 * * * * *', async () => {
      if (!this.isRunning) {
        await this.collectPrices();
      }
    });
    
    logger.info('Stock price collector started - will run every minute at :05 seconds');
  }

  // Collect prices for all tracked stocks
  private async collectPrices() {
    this.isRunning = true;
    
    try {
      logger.info('Starting stock price collection cycle');
      
      // Get all tracked stocks
      const trackedStocks = await prisma.stock.findMany({
        where: {
          isTracked: true,
          isActive: true
        },
        orderBy: {
          symbol: 'asc'
        }
      });

      if (trackedStocks.length === 0) {
        logger.info('No tracked stocks found');
        this.isRunning = false;
        return;
      }

      logger.info(`Found ${trackedStocks.length} tracked stocks to update`);

      // Process stocks in batches
      for (let i = 0; i < trackedStocks.length; i += this.batchSize) {
        const batch = trackedStocks.slice(i, i + this.batchSize);
        
        await Promise.all(
          batch.map(async (stock) => {
            try {
              // Get latest price
              const priceData = await this.aggregatedService.getStockPrice(stock.symbol);
              
              if (priceData) {
                // Save to history
                await prisma.stockPriceHistory.create({
                  data: {
                    stockId: stock.id,
                    symbol: stock.symbol,
                    currentPrice: priceData.currentPrice,
                    previousClose: priceData.previousClose,
                    dayOpen: priceData.dayOpen,
                    dayHigh: priceData.dayHigh,
                    dayLow: priceData.dayLow,
                    volume: BigInt(priceData.volume || 0),
                    change: priceData.change,
                    changePercent: priceData.changePercent,
                    source: 'aggregated',
                    timestamp: new Date()
                  }
                });

                // Update current stock data
                await prisma.stock.update({
                  where: { id: stock.id },
                  data: {
                    currentPrice: priceData.currentPrice,
                    previousClose: priceData.previousClose,
                    dayOpen: priceData.dayOpen,
                    dayHigh: priceData.dayHigh,
                    dayLow: priceData.dayLow,
                    volume: BigInt(priceData.volume || 0),
                  }
                });

                logger.info(`Updated price for ${stock.symbol}: ${priceData.currentPrice}`);
              } else {
                logger.warn(`Failed to get price for ${stock.symbol}`);
              }
            } catch (error) {
              logger.error(`Error updating ${stock.symbol}:`, error);
            }
          })
        );

        // Delay between batches to avoid rate limits
        if (i + this.batchSize < trackedStocks.length) {
          await new Promise(resolve => setTimeout(resolve, this.delayBetweenBatches));
        }
      }

      logger.info('Stock price collection cycle completed');
      
      // Clean up old history (keep only last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      await prisma.stockPriceHistory.deleteMany({
        where: {
          timestamp: {
            lt: sevenDaysAgo
          }
        }
      });

    } catch (error) {
      logger.error('Error in stock price collection:', error);
    } finally {
      this.isRunning = false;
    }
  }

  // Manually trigger price collection
  async collectNow() {
    if (!this.isRunning) {
      await this.collectPrices();
    } else {
      logger.warn('Price collection already in progress');
    }
  }

  // Get latest prices from history (for API responses)
  async getLatestPricesFromHistory(symbols: string[]) {
    const prices = await prisma.stockPriceHistory.findMany({
      where: {
        symbol: {
          in: symbols
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      distinct: ['symbol'],
    });

    return prices;
  }
}

// Singleton instance
let collectorInstance: StockPriceCollector | null = null;

export function getStockPriceCollector(): StockPriceCollector {
  if (!collectorInstance) {
    collectorInstance = new StockPriceCollector();
  }
  return collectorInstance;
}