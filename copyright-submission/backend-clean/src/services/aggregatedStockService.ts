import { logger } from '../utils/logger';
import { NaverFinanceService } from './naverFinanceService';

import { DaumFinanceService } from './daumFinanceService';
import { YahooFinanceService } from './yahooFinanceService';
import { AlphaVantageService } from './alphaVantageService';
import { KISService } from './kisService';
import { DatabaseStockService } from './databaseStockService';
import { CrawlerStockService } from './crawlerStockService';
import { prisma } from '../config/database'에러가 발생했습니다'crawler', 'database', 'kis'에러가 발생했습니다'Failed to fetch stock prices:'에러가 발생했습니다'clearCache' in this.naverV2) {
    //   this.naverV2.clearCache();
    // }
    if ('clearCache' in this.daum) {
      this.daum.clearCache();
    }
    if ('clearCache' in this.yahoo) {
      this.yahoo.clearCache();
    }
  }
}