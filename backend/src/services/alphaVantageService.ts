import axios from 'axios';
import { logger } from '../utils/logger';

interface AlphaVantageStockData {
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

export class AlphaVantageService {
  private apiKey: string;
  private baseUrl = 'https://www.alphavantage.co/query';
  private cache = new Map<string, { data: AlphaVantageStockData; timestamp: number }>();
  private readonly CACHE_TTL = 60000; // 1 minute (Alpha Vantage has rate limits)
  
  // 한국 주식을 위한 심볼 매핑
  private koreanStockMapping: { [key: string]: string } = {
    '005930': 'SSNLF',     // 삼성전자 (Samsung Electronics)
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
      logger.warn('Alpha Vantage API key not configured');
    }
  }

  // 한국 주식 코드를 Alpha Vantage 심볼로 변환
  private getAlphaVantageSymbol(koreanCode: string): string {
    return this.koreanStockMapping[koreanCode] || `${koreanCode}.KS`;
  }

  // 실시간 주식 가격 조회
  async getStockPrice(symbol: string): Promise<AlphaVantageStockData | null> {
    try {
      if (!this.apiKey) {
        logger.warn('Alpha Vantage API key not configured');
        return null;
      }

      // 캐시 확인
      const cached = this.cache.get(symbol);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        logger.info(`Returning cached Alpha Vantage data for ${symbol}`);
        return cached.data;
      }

      const alphaSymbol = this.getAlphaVantageSymbol(symbol);
      logger.info(`Fetching Alpha Vantage data for ${symbol} (${alphaSymbol})`);

      // Global Quote 엔드포인트 사용
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: alphaSymbol,
          apikey: this.apiKey,
        },
        timeout: 10000,
      });

      const data = response.data;
      
      if (!data || !data['Global Quote'] || Object.keys(data['Global Quote']).length === 0) {
        logger.warn(`No data returned from Alpha Vantage for ${alphaSymbol}`);
        return null;
      }

      const quote = data['Global Quote'];
      
      // Alpha Vantage 데이터 매핑
      const stockData: AlphaVantageStockData = {
        symbol: symbol, // 원래 한국 심볼 유지
        name: quote['01. symbol'], // 실제 이름은 별도 API 필요
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
          ['KB', 'SHG', 'PKX'].includes(alphaSymbol)) {
        const usdToKrw = 1300; // 실제로는 환율 API 사용 필요
        stockData.currentPrice = Math.round(stockData.currentPrice * usdToKrw);
        stockData.previousClose = Math.round(stockData.previousClose * usdToKrw);
        stockData.change = Math.round(stockData.change * usdToKrw);
        stockData.dayOpen = Math.round(stockData.dayOpen * usdToKrw);
        stockData.dayHigh = Math.round(stockData.dayHigh * usdToKrw);
        stockData.dayLow = Math.round(stockData.dayLow * usdToKrw);
      }

      // 캐시에 저장
      this.cache.set(symbol, { data: stockData, timestamp: Date.now() });

      logger.info(`Successfully fetched stock price from Alpha Vantage for ${symbol}: ${stockData.currentPrice}`);
      return stockData;
    } catch (error: any) {
      logger.error(`Failed to fetch stock price from Alpha Vantage for ${symbol}:`, {
        message: error.message,
        code: error.code,
        response: error.response?.data,
      });
      return null;
    }
  }

  // 여러 종목 가격 조회 (순차적으로 처리 - API 제한 때문)
  async getMultipleStockPrices(symbols: string[]): Promise<AlphaVantageStockData[]> {
    const results: AlphaVantageStockData[] = [];
    
    // Alpha Vantage free tier는 분당 5개 요청 제한
    for (const symbol of symbols) {
      const stockData = await this.getStockPrice(symbol);
      if (stockData) {
        results.push(stockData);
      }
      
      // Rate limiting: 12초 대기 (분당 5개 요청)
      if (symbols.indexOf(symbol) < symbols.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 12000));
      }
    }
    
    return results;
  }

  // 차트 데이터 조회
  async getHistoricalData(symbol: string, _interval: string = 'daily') {
    try {
      if (!this.apiKey) {
        return [];
      }

      const alphaSymbol = this.getAlphaVantageSymbol(symbol);
      
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: alphaSymbol,
          apikey: this.apiKey,
          outputsize: 'compact', // 최근 100일 데이터
        },
        timeout: 15000,
      });

      const data = response.data;
      
      if (!data || !data['Time Series (Daily)']) {
        return [];
      }

      const timeSeries = data['Time Series (Daily)'];
      const historicalData = Object.entries(timeSeries)
        .map(([date, values]: [string, any]) => ({
          date: new Date(date),
          open: parseFloat(values['1. open']),
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