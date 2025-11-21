import axios from 'axios';
import { logger } from '../utils/logger'에러가 발생했습니다'https://www.alphavantage.co/query'에러가 발생했습니다'005930': 'SSNLF',     // 삼성전자 (Samsung Electronics)
    '000660': '000660.KS', // SK하이닉스
    '005380': 'HYMTF',     // 현대자동차 (Hyundai Motor)
    '035420': '035420.KS', // NAVER
    '051910': '051910.KS', // LG화학
    '006400': '006400.KS', // 삼성SDI
    '035720': '035720.KS', // 카카오
    '003670': 'PKX',       // 포스코 (POSCO)
    '105560': 'KB',        // KB금융
    '055550': 'SHG',       // 신한지주
  };

  constructor() {
    this.apiKey = process.env.Alpha_Vantage_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('Alpha Vantage API key not configured'에러가 발생했습니다'Alpha Vantage API key not configured'에러가 발생했습니다'GLOBAL_QUOTE'에러가 발생했습니다'Global Quote'] || Object.keys(data['Global Quote'에러가 발생했습니다'Global Quote'에러가 발생했습니다'01. symbol'], // 실제 이름은 별도 API 필요
        currentPrice: parseFloat(quote['05. price']) || 0,
        previousClose: parseFloat(quote['08. previous close']) || 0,
        change: parseFloat(quote['09. change']) || 0,
        changePercent: parseFloat(quote['10. change percent']?.replace('%', '') || '0'),
        dayOpen: parseFloat(quote['02. open']) || 0,
        dayHigh: parseFloat(quote['03. high']) || 0,
        dayLow: parseFloat(quote['04. low']) || 0,
        volume: parseInt(quote['06. volume']) || 0,
      };

      // USD to KRW 변환 (한국 주식이 USD로 표시되는 경우)
      if (alphaSymbol.endsWith('LF') || alphaSymbol.endsWith('TF') || 
          ['KB', 'SHG', 'PKX'에러가 발생했습니다'daily'에러가 발생했습니다'TIME_SERIES_DAILY',
          symbol: alphaSymbol,
          apikey: this.apiKey,
          outputsize: 'compact'에러가 발생했습니다'Time Series (Daily)']) {
        return [];
      }

      const timeSeries = data['Time Series (Daily)'에러가 발생했습니다'1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume']),
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      return historicalData;
    } catch (error: any) {
      logger.error(`Failed to fetch historical data from Alpha Vantage for ${symbol}:`, error.message);
      return [];
    }
  }

  // 캐시 초기화
  clearCache() {
    this.cache.clear();
  }
}