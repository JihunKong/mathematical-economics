import cron from 'node-cron';
import { prisma } from '../config/database';
import { AggregatedStockService } from '../services/aggregatedStockService';
import { watchlistService } from '../services/watchlistService';
import { logger } from '../utils/logger';

export class StockPriceCollector {
  private aggregatedService: AggregatedStockService;
  private isRunning: boolean = false;
  private batchSize: number = 3; // Process 3 stocks at a time (더 작은 배치)
  private delayBetweenBatches: number = 5000; // 5 seconds between batches (더 긴 지연)

  constructor() {
    this.aggregatedService = new AggregatedStockService();
  }

  // Start the price collection job
  startCollector() {
    // 시장 시간 중에만 자주 실행 (09:00-15:30, 10분마다)
    // 시장 외 시간에는 30분마다 실행
    
    // 시장 시간: 평일 09:00-15:30, 10분마다
    cron.schedule('*/10 9-15 * * 1-5', async () => {
      if (!this.isRunning) {
        await this.collectPrices();
      }
    });
    
    // 시장 외 시간: 30분마다 (주말 포함)
    cron.schedule('*/30 * * * *', async () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay(); // 0 = Sunday, 6 = Saturday
      
      // 평일 시장 시간이 아닐 때만 실행
      if (day === 0 || day === 6 || hour < 9 || hour > 15) {
        if (!this.isRunning) {
          await this.collectPrices();
        }
      }
    });
    
    logger.info('Stock price collector started - market hours: every 10min, off-hours: every 30min');
  }

  // Collect prices for watchlisted stocks only
  private async collectPrices() {
    this.isRunning = true;
    
    try {
      logger.info('Starting stock price collection cycle');
      
      // Get stocks that are in student watchlists
      const trackedStocks = await watchlistService.getTrackedStocks();

      if (trackedStocks.length === 0) {
        logger.info('No watchlisted stocks found');
        this.isRunning = false;
        return;
      }

      logger.info(`Found ${trackedStocks.length} watchlisted stocks to update`);

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
                    change: priceData.change,
                    changePercent: priceData.changePercent,
                    lastPriceUpdate: new Date()
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