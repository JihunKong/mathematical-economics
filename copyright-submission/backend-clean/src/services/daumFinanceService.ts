import axios from 'axios';
import { logger } from '../utils/logger'에러가 발생했습니다'https://finance.daum.net/api'에러가 발생했습니다'User-Agent': '에러가 발생했습니다',
          'Referer': 'https://finance.daum.net/',
          'Accept': 'application/json, text/plain, **'에러가 발생했습니다''; // Remove 'A' prefix
        const stockData: DaumStockData = {
          symbol,
          name: item.name || ''에러가 발생했습니다'Failed to fetch multiple stock prices from Daum:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
      });
      return [];
    }
  }

  // 캐시 초기화
  clearCache() {
    this.cache.clear();
  }
}