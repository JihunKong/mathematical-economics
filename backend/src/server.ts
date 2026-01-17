import { createApp } from './app';
import { logger } from './utils/logger';
import { prisma } from './config/database';
import { patchBigIntJSON } from './middleware/bigintSerializer';
import { startStockPriceUpdater } from './jobs/stockPriceUpdater';
import { getStockPriceCollector } from './jobs/stockPriceCollector';
import { getPriceHistoryCollector } from './jobs/priceHistoryCollector';
import { stockDataUpdater } from './utils/stockDataUpdater';
import { Server } from 'http';

// Patch BigInt JSON serialization globally
patchBigIntJSON();

const PORT = process.env.PORT || 5000;

async function checkInitialization() {
  try {
    // Check if system is initialized
    const userCount = await prisma.user.count();
    const stockCount = await prisma.stock.count();
    
    logger.info('System status check:');
    logger.info(`  Users: ${userCount}`);
    logger.info(`  Stocks: ${stockCount}`);
    
    if (userCount === 0 || stockCount === 0) {
      logger.warn('System appears to be uninitialized. Please run initialization script.');
    }
    
    // Ensure all users have portfolios
    const usersWithoutPortfolio = await prisma.user.findMany({
      where: { 
        portfolios: {
          none: {}
        }
      },
      select: { id: true, email: true, currentCash: true }
    });
    
    if (usersWithoutPortfolio.length > 0) {
      logger.info(`Creating portfolios for ${usersWithoutPortfolio.length} users...`);
      for (const user of usersWithoutPortfolio) {
        await prisma.portfolio.create({
          data: {
            userId: user.id,
            totalValue: user.currentCash,
            totalCost: 0,
            totalProfitLoss: 0,
            totalProfitLossPercent: 0
          }
        });
      }
      logger.info('Portfolios created successfully');
    }
  } catch (error) {
    logger.error('Error checking initialization:', error);
  }
}

const startServer = async () => {
  let server: Server;

  try {
    // Test database connection with retry
    let dbConnected = false;
    for (let i = 0; i < 5; i++) {
      try {
        await prisma.$connect();
        dbConnected = true;
        logger.info('Database connected successfully');
        break;
      } catch (dbError) {
        logger.warn(`Database connection attempt ${i + 1}/5 failed:`, dbError);
        if (i < 4) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }

    if (!dbConnected) {
      logger.error('Failed to connect to database after 5 attempts');
      // In production, we might want to start anyway and retry later
      if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
      }
      logger.warn('Starting server without database connection...');
    }

    // Check initialization status (skip if no DB)
    if (dbConnected) {
      await checkInitialization();
    }

    const { httpServer } = createApp();

    server = httpServer.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      
      // Delay background jobs to prevent server blocking on startup
      setTimeout(async () => {
        try {
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
          
          // Start price history collector
          const priceHistoryCollector = getPriceHistoryCollector();
          priceHistoryCollector.start();
          logger.info('Price history collector started');
        } catch (error) {
          logger.error('Error starting background jobs:', error);
        }
      }, 10000); // 10 seconds delay
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