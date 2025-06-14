import { createApp } from './app';
import { logger } from './utils/logger';
import { prisma } from './config/database';
import { patchBigIntJSON } from './middleware/bigintSerializer';
import { startStockPriceUpdater } from './jobs/stockPriceUpdater';
import { getStockPriceCollector } from './jobs/stockPriceCollector';
import { stockDataUpdater } from './utils/stockDataUpdater';
import { Server } from 'http';

// Patch BigInt JSON serialization globally
patchBigIntJSON();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  let server: Server;
  
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    const { httpServer } = createApp();

    server = httpServer.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      
      // Start cron jobs for stock price updates
      if (process.env.ENABLE_STOCK_UPDATER === 'true') {
        startStockPriceUpdater();
        
        // Start new stock data updater
        stockDataUpdater.start();
        logger.info('Stock data updater service started');
      }
      
      // Start stock price collector for tracked stocks
      const stockCollector = getStockPriceCollector();
      stockCollector.startCollector();
      logger.info('Stock price collector started');
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
      });
      
      // Stop stock data updater
      stockDataUpdater.stop();
      
      await prisma.$disconnect();
      logger.info('Database connection closed');
      
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();