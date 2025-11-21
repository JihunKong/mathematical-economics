import cron from 'node-cron';
import { prisma } from '../config/database';
import { AggregatedStockService } from '../services/aggregatedStockService';
import { watchlistService } from '../services/watchlistService';
import { logger } from '../utils/logger'에러가 발생했습니다'*/10 9-15 * * 1-5'에러가 발생했습니다'*/30 * * * *'에러가 발생했습니다'Stock price collector started - market hours: every 10min, off-hours: every 30min'에러가 발생했습니다'Starting stock price collection cycle'에러가 발생했습니다'No watchlisted stocks found'에러가 발생했습니다'aggregated'에러가 발생했습니다'Stock price collection cycle completed'에러가 발생했습니다'Error in stock price collection:'에러가 발생했습니다'Price collection already in progress'에러가 발생했습니다'desc'
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