import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger';

interface NaverStockData {
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

export class NaverFinanceService {
  private readonly baseUrl = 'https://finance.naver.com';
  private cache = new Map<string, { data: NaverStockData; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds

  // 네이버 금융 웹 크롤링을 통한 실시간 주식 가격 조회
  async getStockPrice(symbol: string): Promise<NaverStockData | null> {
    try {
      // 캐시 확인
      const cached = this.cache.get(symbol);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        logger.info(`Returning cached Naver data for ${symbol}`);
        return cached.data;
      }

      const url = `${this.baseUrl}/item/main.nhn?code=${symbol}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cache-Control': 'max-age=0',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      
      // 현재가
      const currentPriceText = $('.no_today .blind').first().text().replace(/,/g, '');
      const currentPrice = parseInt(currentPriceText) || 0;
      
      // 전일 대비
      const changeText = $('.no_exday .blind').first().text().replace(/,/g, '');
      const changeMatch = changeText.match(/([하락|상승])\s*([\d,]+)/);
      let change = 0;
      if (changeMatch) {
        change = parseInt(changeMatch[2].replace(/,/g, ''));
        if (changeMatch[1] === '하락') {
          change = -change;
        }
      }
      
      // 종목명
      const name = $('.wrap_company h2 a').text().trim();
      
      // 전일 종가
      const previousClose = currentPrice - change;
      
      // 등락률
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
      
      // 추가 정보 추출
      const dayHighText = $('.no_today em:nth-child(1) .blind').text().replace(/,/g, '');
      const dayLowText = $('.no_today em:nth-child(2) .blind').text().replace(/,/g, '');
      const volumeText = $('.no_today em:nth-child(3) .blind').text().replace(/,/g, '');
      
      const dayHigh = parseInt(dayHighText) || currentPrice;
      const dayLow = parseInt(dayLowText) || currentPrice;
      const volume = parseInt(volumeText) || 0;
      
      // 시가는 종종 별도로 표시됨
      const dayOpen = previousClose; // 기본값으로 전일 종가 사용

      const stockData: NaverStockData = {
        symbol,
        name,
        currentPrice,
        previousClose,
        change,
        changePercent,
        dayOpen,
        dayHigh,
        dayLow,
        volume,
      };

      // 캐시에 저장
      this.cache.set(symbol, { data: stockData, timestamp: Date.now() });

      logger.info(`Successfully fetched stock price from Naver for ${symbol}: ${currentPrice} (change: ${change})`);
      return stockData;
    } catch (error: any) {
      logger.error(`Failed to fetch stock price from Naver for ${symbol}:`, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      return null;
    }
  }

  // 여러 종목의 가격을 한 번에 조회 (개별 크롤링)
  async getMultipleStockPrices(symbols: string[]): Promise<NaverStockData[]> {
    try {
      // 병렬로 개별 종목 조회
      const promises = symbols.map(symbol => this.getStockPrice(symbol));
      const results = await Promise.all(promises);
      
      return results.filter((stock): stock is NaverStockData => stock !== null);
    } catch (error: any) {
      logger.error('Failed to fetch multiple stock prices from Naver:', {
        message: error.message,
        code: error.code
      });
      return [];
    }
  }

  // 캐시 초기화
  clearCache() {
    this.cache.clear();
  }

  // 주식 검색
  async searchStocks(query: string): Promise<NaverStockData[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/search/stock`, {
        params: {
          q: query,
          target: 'stock',
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://finance.naver.com/',
        },
        timeout: 10000,
      });

      const data = response.data;
      
      if (!data || !data.items) {
        return [];
      }

      return data.items.map((item: any) => ({
        symbol: item.cd,
        name: item.nm,
        currentPrice: parseInt(item.nv?.replace(/,/g, '') || '0'),
        previousClose: parseInt(item.pcv?.replace(/,/g, '') || '0'),
        change: parseInt(item.cv?.replace(/,/g, '') || '0'),
        changePercent: parseFloat(item.cr || '0'),
        dayOpen: parseInt(item.ov?.replace(/,/g, '') || '0'),
        dayHigh: parseInt(item.hv?.replace(/,/g, '') || '0'),
        dayLow: parseInt(item.lv?.replace(/,/g, '') || '0'),
        volume: parseInt(item.aq?.replace(/,/g, '') || '0'),
      })).filter((stock: NaverStockData) => stock.currentPrice > 0);
    } catch (error) {
      logger.error(`Failed to search stocks from Naver for query ${query}:`, error);
      return [];
    }
  }

  // 인기 종목 조회
  async getPopularStocks(market: 'KOSPI' | 'KOSDAQ' = 'KOSPI'): Promise<NaverStockData[]> {
    try {
      const marketCode = market === 'KOSPI' ? 'KOSPI' : 'KOSDAQ';
      const response = await axios.get(`${this.baseUrl}/realtime/domestic/index/${marketCode}/stock`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://finance.naver.com/',
        },
        timeout: 10000,
      });

      const data = response.data;
      
      if (!data || !data.datas) {
        return [];
      }

      return data.datas.slice(0, 20).map((stockData: any) => ({
        symbol: stockData.cd,
        name: stockData.nm,
        currentPrice: parseInt(stockData.nv.replace(/,/g, '')),
        previousClose: parseInt(stockData.pcv.replace(/,/g, '')),
        change: parseInt(stockData.cv.replace(/,/g, '')),
        changePercent: parseFloat(stockData.cr),
        dayOpen: parseInt(stockData.ov.replace(/,/g, '')),
        dayHigh: parseInt(stockData.hv.replace(/,/g, '')),
        dayLow: parseInt(stockData.lv.replace(/,/g, '')),
        volume: parseInt(stockData.aq.replace(/,/g, '')),
      })).filter((stock: NaverStockData) => stock.currentPrice > 0);
    } catch (error) {
      logger.error(`Failed to fetch popular stocks from Naver for ${market}:`, error);
      return [];
    }
  }
}