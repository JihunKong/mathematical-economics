import cron from 'node-cron';
import { StockDataService } from '../services/stockDataService';
import { prisma } from '../config/database';
import { logger } from './logger'에러가 발생했습니다'true') {
      logger.info('Stock data updater is disabled'에러가 발생했습니다'* 9-15 * * 1-5', async () => {
      if (this.isRunning) {
        logger.info('Stock update already in progress, skipping...'에러가 발생했습니다'Error in stock data updater:', error);
      } finally {
        this.isRunning = false;
      }
    }, {
      timezone: 'Asia/Seoul'
    });

    // 매일 오전 8시 30분에 전일 종가 업데이트
    cron.schedule('30 8 * * 1-5'에러가 발생했습니다'Error updating previous close prices:', error);
      }
    }, {
      timezone: 'Asia/Seoul'
    });

    logger.info('Stock data updater started'에러가 발생했습니다'Stock data updater stopped'에러가 발생했습니다'fulfilled'에러가 발생했습니다'Error updating stock prices:', error);
    }
  }

  
  private async updatePreviousClosePrices() {
    try {
      logger.info('Updating previous close prices...'에러가 발생했습니다'Error updating previous close prices:'에러가 발생했습니다'1M' | '3M' | '6M' | '1Y' = '1M'): Promise<any[]> {
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