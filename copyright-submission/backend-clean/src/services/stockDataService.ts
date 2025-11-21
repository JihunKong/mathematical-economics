import axios from 'axios';
import { logger } from '../utils/logger';
import { NaverFinanceServiceV2 } from './naverFinanceServiceV2';
import { YahooFinanceService } from './yahooFinanceService';
import { MockStockService } from './mockStockService';
import { NaverChartService } from './naverChartService';
import { KRXApiService } from './krxApiService';
import { prisma } from '../config/database'에러가 발생했습니다'60000');
    this.HISTORICAL_CACHE_TTL = parseInt(process.env.HISTORICAL_DATA_CACHE_TTL || '3600000');
    this.YAHOO_API_URL = process.env.YAHOO_FINANCE_API_URL || 'https://query1.finance.yahoo.com'에러가 발생했습니다'Failed to get multiple prices from KRX:'에러가 발생했습니다'fulfilled'에러가 발생했습니다'1D' | '1W' | '1M' | '3M' | '6M' | '1Y' = '1M'에러가 발생했습니다'day' | 'week' | 'month' = 'day';
      let count = 30;
      
      switch (period) {
        case '1D':
          timeframe = 'day';
          count = 1;
          break;
        case '1W':
          timeframe = 'day';
          count = 7;
          break;
        case '1M':
          timeframe = 'day';
          count = 30;
          break;
        case '3M':
          timeframe = 'day';
          count = 90;
          break;
        case '6M':
          timeframe = 'week';
          count = 26;
          break;
        case '1Y':
          timeframe = 'week'에러가 발생했습니다'1D':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '1W':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1Y'에러가 발생했습니다'asc'에러가 발생했습니다'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'에러가 발생했습니다'\n');
      const headers = lines[0].split(','에러가 발생했습니다','에러가 발생했습니다'All stock data caches cleared');
  }

}