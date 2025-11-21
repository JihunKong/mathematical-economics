import yahooFinance from 'yahoo-finance2';
import { logger } from '../utils/logger'에러가 발생했습니다'.KS') || symbol.endsWith('.KQ'에러가 발생했습니다'035420', '035720', '036570', '251270', '293490'에러가 발생했습니다''에러가 발생했습니다', '에러가 발생했습니다''에러가 발생했습니다'Failed to fetch multiple stock prices from Yahoo:'에러가 발생했습니다'1mo'에러가 발생했습니다'1d':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '1w':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '1mo':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case '3mo':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6mo':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '1y'에러가 발생했습니다'1d', // daily data
      });

      return historical.map(day => ({
        date: day.date,
        open: day.open,
        high: day.high,
        low: day.low,
        close: day.close,
        volume: day.volume,
      }));
    } catch (error: any) {
      logger.error(`Failed to fetch historical data from Yahoo for ${symbol}:`, {
        message: error.message,
        code: error.code,
      });
      return [];
    }
  }

  // 캐시 초기화
  clearCache() {
    this.cache.clear();
  }
}