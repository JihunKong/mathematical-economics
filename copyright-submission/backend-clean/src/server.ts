import { createApp } from './app';
import { logger } from './utils/logger';
import { prisma } from './config/database';
import { patchBigIntJSON } from './middleware/bigintSerializer';
import { startStockPriceUpdater } from './jobs/stockPriceUpdater';
import { getStockPriceCollector } from './jobs/stockPriceCollector';
import { getPriceHistoryCollector } from './jobs/priceHistoryCollector';
import { stockDataUpdater } from './utils/stockDataUpdater';
import { Server } from 'http'에러가 발생했습니다'System status check:'에러가 발생했습니다'System appears to be uninitialized. Please run initialization script.'에러가 발생했습니다'Portfolios created successfully');
    }
  } catch (error) {
    logger.error('Error checking initialization:'에러가 발생했습니다'Database connected successfully'에러가 발생했습니다'true'에러가 발생했습니다'Stock data updater service started'에러가 발생했습니다'Stock price collector started'에러가 발생했습니다'Price history collector started');
        } catch (error) {
          logger.error('Error starting background jobs:'에러가 발생했습니다'SIGTERM', async () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed'에러가 발생했습니다'Database connection closed');
      
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();