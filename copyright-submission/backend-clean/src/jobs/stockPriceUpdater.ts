import cron from 'node-cron';
import { prisma } from '../config/database';
import { RealStockService } from '../services/realStockService';
import { logger } from '../utils/logger'에러가 발생했습니다'*/1 9-15 * * 1-5'에러가 발생했습니다'Starting stock price update job'에러가 발생했습니다'Stock price update job failed:'에러가 발생했습니다'0 16 * * 1-5', async () => {
    try {
      logger.info('Starting daily stock data cleanup'에러가 발생했습니다'Daily cleanup job failed:'에러가 발생했습니다'30 8 * * *', async () => {
    try {
      logger.info('Updating popular stocks');
      
      const kospiStocks = await realStockService.getPopularStocks('KOSPI');
      const kosdaqStocks = await realStockService.getPopularStocks('KOSDAQ'에러가 발생했습니다'Popular stocks update completed');
    } catch (error: any) {
      logger.error('Popular stocks update job failed:'에러가 발생했습니다'Stock price updater cron jobs started'에러가 발생했습니다'Manual price update failed:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};