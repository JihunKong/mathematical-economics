import cron from 'node-cron';
import { StockDataService } from '../services/stockDataService';
import { prisma } from '../config/database';
import { logger } from './logger';

export class StockDataUpdater {
  private stockDataService: StockDataService;
  private updateJob: cron.ScheduledTask | null = null;
  private isRunning: boolean = false;

  constructor() {
    this.stockDataService = new StockDataService();
  }

  /**
   * 주식 데이터 업데이트 크론 작업 시작
   * 평일 오전 9시 ~ 오후 3시 30분 동안 1분마다 실행
   */
  start() {
    if (process.env.ENABLE_STOCK_UPDATER !== 'true') {
      logger.info('Stock data updater is disabled');
      return;
    }

    // 한국 주식시장 운영시간: 평일 09:00 ~ 15:30
    // 매 분마다 실행 (월-금, 9-15시)
    this.updateJob = cron.schedule('* 9-15 * * 1-5', async () => {
      if (this.isRunning) {
        logger.info('Stock update already in progress, skipping...');
        return;
      }

      try {
        this.isRunning = true;
        await this.updateStockPrices();
      } catch (error) {
        logger.error('Error in stock data updater:', error);
      } finally {
        this.isRunning = false;
      }
    }, {
      timezone: 'Asia/Seoul'
    });

    // 매일 오전 8시 30분에 전일 종가 업데이트
    cron.schedule('30 8 * * 1-5', async () => {
      try {
        await this.updatePreviousClosePrices();
      } catch (error) {
        logger.error('Error updating previous close prices:', error);
      }
    }, {
      timezone: 'Asia/Seoul'
    });

    logger.info('Stock data updater started');
  }

  /**
   * 크론 작업 중지
   */
  stop() {
    if (this.updateJob) {
      this.updateJob.stop();
      this.updateJob = null;
      logger.info('Stock data updater stopped');
    }
  }

  /**
   * 활성화된 모든 주식의 실시간 가격 업데이트
   */
  private async updateStockPrices() {
    try {
      const activeStocks = await prisma.stock.findMany({
        where: { isActive: true },
        select: { symbol: true },
        take: 50, // API 제한을 고려하여 배치 크기 제한
      });

      if (activeStocks.length === 0) {
        return;
      }

      const symbols = activeStocks.map(stock => stock.symbol);
      logger.info(`Updating prices for ${symbols.length} stocks`);

      // 배치로 가격 업데이트
      const batchSize = 10;
      for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize);
        const pricePromises = batch.map(symbol => this.stockDataService.getStockPrice(symbol));
        
        const results = await Promise.allSettled(pricePromises);
        
        let successCount = 0;
        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            successCount++;
          } else {
            logger.warn(`Failed to update price for ${batch[index]}`);
          }
        });

        logger.info(`Successfully updated ${successCount}/${batch.length} stock prices in batch`);

        // API 제한 방지를 위한 딜레이
        if (i + batchSize < symbols.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    } catch (error) {
      logger.error('Error updating stock prices:', error);
    }
  }

  /**
   * 전일 종가 업데이트 (매일 장 시작 전 실행)
   */
  private async updatePreviousClosePrices() {
    try {
      logger.info('Updating previous close prices...');

      const stocks = await prisma.stock.findMany({
        where: { isActive: true },
      });

      for (const stock of stocks) {
        await prisma.stock.update({
          where: { id: stock.id },
          data: {
            previousClose: stock.currentPrice,
          },
        });
      }

      logger.info(`Updated previous close prices for ${stocks.length} stocks`);
    } catch (error) {
      logger.error('Error updating previous close prices:', error);
    }
  }

  /**
   * 수동으로 특정 주식 가격 업데이트
   */
  async updateSingleStock(symbol: string): Promise<any> {
    try {
      const priceData = await this.stockDataService.getStockPrice(symbol);
      
      if (priceData) {
        logger.info(`Successfully updated price for ${symbol}: ${priceData.currentPrice}`);
        return priceData;
      } else {
        logger.warn(`Failed to get price data for ${symbol}`);
        return null;
      }
    } catch (error) {
      logger.error(`Error updating single stock ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * 과거 데이터 백필 (초기 데이터 로드용)
   */
  async backfillHistoricalData(symbol: string, period: '1M' | '3M' | '6M' | '1Y' = '1M'): Promise<any[]> {
    try {
      logger.info(`Backfilling historical data for ${symbol} (${period})`);
      
      const historicalData = await this.stockDataService.getHistoricalData(symbol, period);
      
      if (historicalData.length > 0) {
        logger.info(`Successfully backfilled ${historicalData.length} data points for ${symbol}`);
        return historicalData;
      } else {
        logger.warn(`No historical data available for ${symbol}`);
        return [];
      }
    } catch (error) {
      logger.error(`Error backfilling historical data for ${symbol}:`, error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
export const stockDataUpdater = new StockDataUpdater();