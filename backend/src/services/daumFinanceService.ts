import axios from 'axios';
import { logger } from '../utils/logger';

interface DaumStockData {
  symbol: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayOpen: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  marketCap?: number;
}

export class DaumFinanceService {
  private readonly baseUrl = 'https://finance.daum.net/api';
  private cache = new Map<string, { data: DaumStockData; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds

  // 다음 금융 API를 통한 실시간 주식 가격 조회
  async getStockPrice(symbol: string): Promise<DaumStockData | null> {
    try {
      // 캐시 확인
      const cached = this.cache.get(symbol);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        logger.info(`Returning cached Daum data for ${symbol}`);
        return cached.data;
      }

      // 다음 금융 API 호출
      const response = await axios.get(`${this.baseUrl}/quotes/A${symbol}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://finance.daum.net/',
          'Accept': 'application/json, text/plain, */*',
        },
        timeout: 10000,
      });

      const data = response.data;
      
      if (!data) {
        return null;
      }

      const stockData: DaumStockData = {
        symbol: symbol,
        name: data.name || '',
        currentPrice: data.tradePrice || 0,
        previousClose: data.prevClosingPrice || 0,
        change: data.change || 0,
        changePercent: data.changeRate ? data.changeRate * 100 : 0,
        dayOpen: data.openingPrice || 0,
        dayHigh: data.highPrice || 0,
        dayLow: data.lowPrice || 0,
        volume: data.accTradeVolume || 0,
        marketCap: data.marketCap,
      };

      // 캐시에 저장
      this.cache.set(symbol, { data: stockData, timestamp: Date.now() });

      logger.info(`Successfully fetched stock price from Daum for ${symbol}: ${stockData.currentPrice}`);
      return stockData;
    } catch (error: any) {
      logger.error(`Failed to fetch stock price from Daum for ${symbol}:`, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
      });
      return null;
    }
  }

  // 여러 종목의 가격을 한 번에 조회
  async getMultipleStockPrices(symbols: string[]): Promise<DaumStockData[]> {
    try {
      // 다음 API는 여러 종목을 한 번에 조회 가능
      const symbolsWithPrefix = symbols.map(s => `A${s}`).join(',');
      
      const response = await axios.get(`${this.baseUrl}/quotes`, {
        params: {
          codes: symbolsWithPrefix,
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://finance.daum.net/',
          'Accept': 'application/json, text/plain, */*',
        },
        timeout: 15000,
      });

      const data = response.data;
      
      if (!data || !Array.isArray(data)) {
        return [];
      }

      const results: DaumStockData[] = data.map((item: any) => {
        const symbol = item.code ? item.code.substring(1) : ''; // Remove 'A' prefix
        const stockData: DaumStockData = {
          symbol,
          name: item.name || '',
          currentPrice: item.tradePrice || 0,
          previousClose: item.prevClosingPrice || 0,
          change: item.change || 0,
          changePercent: item.changeRate ? item.changeRate * 100 : 0,
          dayOpen: item.openingPrice || 0,
          dayHigh: item.highPrice || 0,
          dayLow: item.lowPrice || 0,
          volume: item.accTradeVolume || 0,
          marketCap: item.marketCap,
        };

        // 캐시에 저장
        this.cache.set(symbol, { data: stockData, timestamp: Date.now() });
        
        return stockData;
      });

      logger.info(`Successfully fetched ${results.length} stock prices from Daum`);
      return results;
    } catch (error: any) {
      logger.error('Failed to fetch multiple stock prices from Daum:', {
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