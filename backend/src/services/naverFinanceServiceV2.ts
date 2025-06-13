import axios from 'axios';
const cheerio = require('cheerio');
import { logger } from '../utils/logger';

interface StockPriceData {
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

export class NaverFinanceServiceV2 {
  private cache = new Map<string, { data: StockPriceData; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds

  // 네이버 증권 웹페이지에서 직접 파싱
  async getStockPrice(symbol: string): Promise<StockPriceData | null> {
    try {
      // 캐시 확인
      const cached = this.cache.get(symbol);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        logger.info(`Returning cached data for ${symbol}`);
        return cached.data;
      }

      // 네이버 증권 페이지 URL
      const url = `https://finance.naver.com/item/main.naver?code=${symbol}`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000,
        responseType: 'text',
      });

      const $ = cheerio.load(response.data);
      
      // 주식 정보 파싱
      const name = $('.wrap_company h2 a').text().trim();
      const currentPriceText = $('#_nowVal').text().replace(/,/g, '');
      const currentPrice = parseInt(currentPriceText);

      // 전일 종가 계산
      const changeText = $('#_diff .blind').text();
      const change = parseInt(changeText.replace(/[^0-9-]/g, ''));
      const previousClose = currentPrice - change;

      // 변동률
      const changePercentText = $('#_rate .blind').text();
      const changePercent = parseFloat(changePercentText.replace(/[^0-9.-]/g, ''));

      // 추가 정보
      const dayHighText = $('.no_info tr:nth-child(1) td:nth-child(1) .blind').text();
      const dayLowText = $('.no_info tr:nth-child(2) td:nth-child(1) .blind').text();
      const volumeText = $('.no_info tr:nth-child(3) td:nth-child(1) .blind').text();
      const dayOpenText = $('.no_info tr:nth-child(4) td:nth-child(1) .blind').text();

      const stockData: StockPriceData = {
        symbol,
        name,
        currentPrice,
        previousClose,
        change,
        changePercent,
        dayOpen: parseInt(dayOpenText.replace(/,/g, '')) || currentPrice,
        dayHigh: parseInt(dayHighText.replace(/,/g, '')) || currentPrice,
        dayLow: parseInt(dayLowText.replace(/,/g, '')) || currentPrice,
        volume: parseInt(volumeText.replace(/,/g, '')) || 0,
      };

      // 캐시에 저장
      this.cache.set(symbol, { data: stockData, timestamp: Date.now() });

      logger.info(`Successfully fetched stock price for ${symbol}: ${currentPrice}`);
      return stockData;
    } catch (error: any) {
      logger.error(`Failed to fetch stock price from Naver for ${symbol}:`, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
      });
      return null;
    }
  }

  // 여러 종목 가격 조회 (순차적으로 처리)
  async getMultipleStockPrices(symbols: string[]): Promise<StockPriceData[]> {
    const results: StockPriceData[] = [];
    
    // 동시 요청을 제한하여 차단 방지
    const batchSize = 3;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const batchPromises = batch.map(symbol => this.getStockPrice(symbol));
      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled' && result.value) {
          results.push(result.value);
        }
      }
      
      // 배치 간 딜레이
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  // 캐시 초기화
  clearCache() {
    this.cache.clear();
  }
}