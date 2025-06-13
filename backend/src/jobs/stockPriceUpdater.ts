import cron from 'node-cron';
import { prisma } from '../config/database';
import { RealStockService } from '../services/realStockService';
import { logger } from '../utils/logger';

const realStockService = new RealStockService();

// 주식 가격 업데이트 작업
export const startStockPriceUpdater = () => {
  // 평일 오전 9시부터 오후 3시 30분까지 1분마다 실행
  cron.schedule('*/1 9-15 * * 1-5', async () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // 오후 3시 30분 이후에는 실행하지 않음
    if (hours === 15 && minutes > 30) {
      return;
    }

    try {
      logger.info('Starting stock price update job');
      
      // 활성화된 모든 주식 가져오기
      const activeStocks = await prisma.stock.findMany({
        where: { isActive: true },
        select: { symbol: true }
      });

      const symbols = activeStocks.map(stock => stock.symbol);
      
      if (symbols.length > 0) {
        const result = await realStockService.updateMultipleStockPrices(symbols);
        logger.info(`Stock price update completed: ${result.succeeded} succeeded, ${result.failed} failed`);
      }
    } catch (error: any) {
      logger.error('Stock price update job failed:', {
        message: error.message,
        stack: error.stack
      });
    }
  });

  // 장 마감 후 일일 데이터 정리 (평일 오후 4시)
  cron.schedule('0 16 * * 1-5', async () => {
    try {
      logger.info('Starting daily stock data cleanup');
      
      // 오래된 가격 히스토리 데이터 정리 (30일 이상)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const deleted = await prisma.priceHistory.deleteMany({
        where: {
          date: {
            lt: thirtyDaysAgo
          }
        }
      });
      
      logger.info(`Deleted ${deleted.count} old price history records`);
    } catch (error: any) {
      logger.error('Daily cleanup job failed:', {
        message: error.message,
        stack: error.stack
      });
    }
  });

  // 매일 오전 8시 30분에 인기 종목 업데이트
  cron.schedule('30 8 * * *', async () => {
    try {
      logger.info('Updating popular stocks');
      
      const kospiStocks = await realStockService.getPopularStocks('KOSPI');
      const kosdaqStocks = await realStockService.getPopularStocks('KOSDAQ');
      
      // 인기 종목들의 정보를 데이터베이스에 업데이트
      for (const stock of [...kospiStocks, ...kosdaqStocks]) {
        try {
          await realStockService.initializeStockFromKIS(stock.symbol);
        } catch (error: any) {
          logger.error(`Failed to initialize stock ${stock.symbol}:`, {
            message: error.message,
            stack: error.stack
          });
        }
      }
      
      logger.info('Popular stocks update completed');
    } catch (error: any) {
      logger.error('Popular stocks update job failed:', {
        message: error.message,
        stack: error.stack
      });
    }
  });

  logger.info('Stock price updater cron jobs started');
};

// 수동으로 가격 업데이트 트리거
export const triggerPriceUpdate = async () => {
  try {
    const activeStocks = await prisma.stock.findMany({
      where: { isActive: true },
      select: { symbol: true }
    });

    const symbols = activeStocks.map(stock => stock.symbol);
    
    if (symbols.length > 0) {
      const result = await realStockService.updateMultipleStockPrices(symbols);
      return result;
    }
    
    return { succeeded: 0, failed: 0 };
  } catch (error: any) {
    logger.error('Manual price update failed:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};