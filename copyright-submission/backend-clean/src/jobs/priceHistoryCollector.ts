import cron from 'node-cron';
import { prisma } from '../config/database';
import { logger } from '../utils/logger'에러가 발생했습니다'*/5 9-15 * * 1-5'에러가 발생했습니다'Asia/Seoul'
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
      logger.info('Starting price history collection...'에러가 발생했습니다'Error in price history collection:'에러가 발생했습니다'Error cleaning up old price history:', error);
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