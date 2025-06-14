import axios from 'axios';
import { logger } from '../utils/logger';
import { NaverFinanceServiceV2 } from './naverFinanceServiceV2';
import { YahooFinanceService } from './yahooFinanceService';
import { MockStockService } from './mockStockService';
import { NaverChartService } from './naverChartService';
import { KRXApiService } from './krxApiService';
import { prisma } from '../config/database';
import { StockData, ChartData } from '../types/stock.types';

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
  timestamp: Date;
}

interface HistoricalData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class StockDataService {
  private naverService: NaverFinanceServiceV2;
  private yahooService: YahooFinanceService;
  private mockService: MockStockService;
  private naverChartService: NaverChartService;
  private krxService: KRXApiService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL: number;
  private readonly HISTORICAL_CACHE_TTL: number;
  private readonly YAHOO_API_URL: string;

  constructor() {
    this.naverService = new NaverFinanceServiceV2();
    this.yahooService = new YahooFinanceService();
    this.mockService = new MockStockService();
    this.naverChartService = new NaverChartService();
    this.krxService = new KRXApiService();
    
    // 환경변수에서 설정 읽기
    this.CACHE_TTL = parseInt(process.env.STOCK_DATA_CACHE_TTL || '60000');
    this.HISTORICAL_CACHE_TTL = parseInt(process.env.HISTORICAL_DATA_CACHE_TTL || '3600000');
    this.YAHOO_API_URL = process.env.YAHOO_FINANCE_API_URL || 'https://query1.finance.yahoo.com';
  }

  /**
   * 주식 실시간 가격 데이터 조회
   * KRX API를 우선적으로 사용하여 실시간 데이터를 가져옴
   */
  async getStockPrice(symbol: string): Promise<StockPriceData | null> {
    try {
      // 캐시 확인
      const cacheKey = `price:${symbol}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        logger.info(`Returning cached price data for ${symbol}`);
        return cached.data;
      }

      // 1. KRX API에서 실시간 데이터 시도 (장중에 가장 정확함)
      const krxData = await this.krxService.getStockPrice(symbol);
      if (krxData) {
        const priceData: StockPriceData = {
          ...krxData,
          timestamp: new Date(),
        };
        this.cache.set(cacheKey, { data: priceData, timestamp: Date.now() });
        await this.savePriceToDatabase(priceData);
        return priceData;
      }

      // 2. 네이버 금융에서 시도 (장 마감 후 또는 KRX 실패 시)
      const naverData = await this.naverService.getStockPrice(symbol);
      if (naverData) {
        const priceData: StockPriceData = {
          ...naverData,
          timestamp: new Date(),
        };
        this.cache.set(cacheKey, { data: priceData, timestamp: Date.now() });
        await this.savePriceToDatabase(priceData);
        return priceData;
      }

      // 3. Yahoo Finance 시도 (국제 주식용)
      const yahooSymbol = this.convertToYahooSymbol(symbol);
      const yahooData = await this.yahooService.getStockData([yahooSymbol]);
      if (yahooData && yahooData.length > 0) {
        const stock = yahooData[0];
        const priceData: StockPriceData = {
          symbol,
          name: stock.name,
          currentPrice: stock.currentPrice,
          previousClose: stock.previousClose,
          change: stock.change,
          changePercent: stock.changePercent,
          dayOpen: stock.dayOpen,
          dayHigh: stock.dayHigh,
          dayLow: stock.dayLow,
          volume: stock.volume,
          marketCap: stock.marketCap,
          timestamp: new Date(),
        };
        this.cache.set(cacheKey, { data: priceData, timestamp: Date.now() });
        await this.savePriceToDatabase(priceData);
        return priceData;
      }

      // 4. 모든 실제 소스 실패시 Mock 데이터 사용
      logger.warn(`Using mock data for ${symbol} as real sources failed`);
      const mockData = await this.mockService.getStockPrice(symbol);
      if (mockData) {
        const priceData: StockPriceData = {
          ...mockData,
          timestamp: new Date(),
        };
        this.cache.set(cacheKey, { data: priceData, timestamp: Date.now() });
        return priceData;
      }

      return null;
    } catch (error: any) {
      logger.error(`Failed to get stock price for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * 여러 종목의 가격 데이터 일괄 조회
   * KRX API를 활용하여 효율적으로 처리
   */
  async getMultipleStockPrices(symbols: string[]): Promise<StockPriceData[]> {
    try {
      // KRX API로 한 번에 여러 종목 조회 시도
      const krxResults = await this.krxService.getMultipleStockPrices(symbols);
      if (krxResults && krxResults.length > 0) {
        const results = krxResults.map(data => ({
          ...data,
          timestamp: new Date(),
        }));
        
        // 캐시 업데이트
        for (const result of results) {
          const cacheKey = `price:${result.symbol}`;
          this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
        }
        
        return results;
      }
    } catch (error: any) {
      logger.error('Failed to get multiple prices from KRX:', error);
    }

    // KRX 실패 시 개별 조회
    const results: StockPriceData[] = [];
    
    // 배치 처리로 API 호출 제한 관리
    const batchSize = 5;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const batchPromises = batch.map(symbol => this.getStockPrice(symbol));
      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled' && result.value) {
          results.push(result.value);
        }
      }
      
      // 배치 간 딜레이 (API 제한 방지)
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return results;
  }

  /**
   * 주식 과거 데이터 조회 (차트용)
   * 네이버 금융 차트 API와 KRX 실시간 데이터를 결합
   */
  async getHistoricalData(
    symbol: string,
    period: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' = '1M'
  ): Promise<HistoricalData[]> {
    try {
      // 캐시 확인
      const cacheKey = `historical:${symbol}:${period}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.HISTORICAL_CACHE_TTL) {
        logger.info(`Returning cached historical data for ${symbol}`);
        return cached.data;
      }

      // 기간별 데이터 포인트 수 결정
      let timeframe: 'day' | 'week' | 'month' = 'day';
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
          timeframe = 'week';
          count = 52;
          break;
      }

      // 1. 네이버에서 차트 데이터 가져오기
      const naverChartData = await this.naverChartService.getChartData(symbol, timeframe, count);
      if (naverChartData && naverChartData.length > 0) {
        const formattedData = this.naverChartService.formatChartData(naverChartData);
        
        // 2. 오늘 데이터가 있는지 확인하고 KRX에서 추가
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const lastDataDate = new Date(formattedData[formattedData.length - 1].date);
        lastDataDate.setHours(0, 0, 0, 0);
        
        // 오늘 데이터가 없고 장중이면 KRX에서 실시간 데이터 추가
        if (lastDataDate < today && this.isMarketDay(today)) {
          const krxData = await this.krxService.getStockPrice(symbol);
          if (krxData) {
            formattedData.push({
              date: new Date(),
              open: krxData.dayOpen,
              high: krxData.dayHigh,
              low: krxData.dayLow,
              close: krxData.currentPrice,
              volume: krxData.volume,
            });
          }
        }
        
        this.cache.set(cacheKey, { data: formattedData, timestamp: Date.now() });
        await this.saveHistoricalToDatabase(symbol, formattedData);
        return formattedData;
      }

      // 2. 데이터베이스에서 조회
      const endDate = new Date();
      const startDate = new Date();
      this.calculateDateRange(startDate, period);
      
      const dbData = await this.getHistoricalFromDatabase(symbol, startDate, endDate);
      if (dbData && dbData.length > 0) {
        this.cache.set(cacheKey, { data: dbData, timestamp: Date.now() });
        return dbData;
      }

      // 3. Yahoo Finance에서 과거 데이터 조회
      const yahooSymbol = this.convertToYahooSymbol(symbol);
      const yahooData = await this.fetchYahooHistoricalData(yahooSymbol, startDate, endDate);
      if (yahooData && yahooData.length > 0) {
        await this.saveHistoricalToDatabase(symbol, yahooData);
        this.cache.set(cacheKey, { data: yahooData, timestamp: Date.now() });
        return yahooData;
      }

      // 4. Mock 데이터 생성
      logger.warn(`Using mock historical data for ${symbol}`);
      const mockData = this.generateMockHistoricalData(symbol, startDate, endDate);
      this.cache.set(cacheKey, { data: mockData, timestamp: Date.now() });
      return mockData;
    } catch (error: any) {
      logger.error(`Failed to get historical data for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * 기간에 따른 시작 날짜 계산
   */
  private calculateDateRange(startDate: Date, period: string): void {
    switch (period) {
      case '1D':
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
      case '1Y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
  }

  /**
   * 장 운영일 확인
   */
  private isMarketDay(date: Date): boolean {
    const dayOfWeek = date.getDay();
    // 주말 제외
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return false;
    }
    // TODO: 공휴일 체크 로직 추가
    return true;
  }

  /**
   * 데이터베이스에서 과거 데이터 조회
   */
  private async getHistoricalFromDatabase(
    symbol: string,
    startDate: Date,
    endDate: Date
  ): Promise<HistoricalData[]> {
    const stock = await prisma.stock.findUnique({
      where: { symbol: symbol.toUpperCase() },
    });

    if (!stock) {
      return [];
    }

    const priceHistory = await prisma.priceHistory.findMany({
      where: {
        stockId: stock.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    return priceHistory.map(item => ({
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: Number(item.volume),
    }));
  }

  /**
   * Yahoo Finance에서 과거 데이터 가져오기
   */
  private async fetchYahooHistoricalData(
    symbol: string,
    startDate: Date,
    endDate: Date
  ): Promise<HistoricalData[]> {
    try {
      const period1 = Math.floor(startDate.getTime() / 1000);
      const period2 = Math.floor(endDate.getTime() / 1000);
      
      const url = `${this.YAHOO_API_URL}/v7/finance/download/${symbol}?period1=${period1}&period2=${period2}&interval=1d&events=history`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000,
      });

      // CSV 파싱
      const lines = response.data.split('\n');
      const headers = lines[0].split(',');
      const data: HistoricalData[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length === headers.length) {
          data.push({
            date: new Date(values[0]),
            open: parseFloat(values[1]),
            high: parseFloat(values[2]),
            low: parseFloat(values[3]),
            close: parseFloat(values[4]),
            volume: parseInt(values[6]),
          });
        }
      }

      return data;
    } catch (error: any) {
      logger.error(`Failed to fetch Yahoo historical data for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Mock 과거 데이터 생성
   */
  private generateMockHistoricalData(
    symbol: string,
    startDate: Date,
    endDate: Date
  ): HistoricalData[] {
    const data: HistoricalData[] = [];
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let basePrice = 50000;
    const volatility = 0.02; // 2% 일일 변동성

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // 주말 제외
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }

      // 랜덤 가격 변동
      const changePercent = (Math.random() - 0.5) * volatility * 2;
      const open = basePrice;
      const close = basePrice * (1 + changePercent);
      const high = Math.max(open, close) * (1 + Math.random() * volatility);
      const low = Math.min(open, close) * (1 - Math.random() * volatility);
      const volume = Math.floor(Math.random() * 1000000) + 100000;

      data.push({
        date,
        open: Math.round(open),
        high: Math.round(high),
        low: Math.round(low),
        close: Math.round(close),
        volume,
      });

      basePrice = close;
    }

    return data;
  }

  /**
   * 가격 데이터를 데이터베이스에 저장
   */
  private async savePriceToDatabase(priceData: StockPriceData): Promise<void> {
    try {
      const stock = await prisma.stock.findUnique({
        where: { symbol: priceData.symbol.toUpperCase() },
      });

      if (!stock) {
        return;
      }

      // StockPriceHistory에 저장
      await prisma.stockPriceHistory.create({
        data: {
          symbol: priceData.symbol.toUpperCase(),
          currentPrice: priceData.currentPrice,
          previousClose: priceData.previousClose,
          dayOpen: priceData.dayOpen,
          dayHigh: priceData.dayHigh,
          dayLow: priceData.dayLow,
          volume: BigInt(priceData.volume),
          timestamp: priceData.timestamp,
        },
      });

      // Stock 테이블 업데이트
      await prisma.stock.update({
        where: { id: stock.id },
        data: {
          currentPrice: priceData.currentPrice,
          previousClose: priceData.previousClose,
          dayOpen: priceData.dayOpen,
          dayHigh: priceData.dayHigh,
          dayLow: priceData.dayLow,
          volume: BigInt(priceData.volume),
        },
      });
    } catch (error: any) {
      logger.error(`Failed to save price data to database:`, error);
    }
  }

  /**
   * 과거 데이터를 데이터베이스에 저장
   */
  private async saveHistoricalToDatabase(
    symbol: string,
    historicalData: HistoricalData[]
  ): Promise<void> {
    try {
      const stock = await prisma.stock.findUnique({
        where: { symbol: symbol.toUpperCase() },
      });

      if (!stock) {
        return;
      }

      // 배치로 저장
      const batchSize = 100;
      for (let i = 0; i < historicalData.length; i += batchSize) {
        const batch = historicalData.slice(i, i + batchSize);
        
        await prisma.priceHistory.createMany({
          data: batch.map(item => ({
            stockId: stock.id,
            date: item.date,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: BigInt(item.volume),
          })),
          skipDuplicates: true,
        });
      }
    } catch (error: any) {
      logger.error(`Failed to save historical data to database:`, error);
    }
  }

  /**
   * 한국 주식 심볼을 Yahoo Finance 심볼로 변환
   */
  private convertToYahooSymbol(symbol: string): string {
    // 한국 주식의 경우 .KS (KOSPI) 또는 .KQ (KOSDAQ) 추가
    if (/^\d{6}$/.test(symbol)) {
      // 간단한 매핑 (실제로는 더 정교한 로직 필요)
      return `${symbol}.KS`;
    }
    return symbol;
  }

  /**
   * 캐시 초기화
   */
  clearCache(): void {
    this.cache.clear();
    this.naverChartService.clearCache();
    this.krxService.clearCache();
    logger.info('All stock data caches cleared');
  }

  /**
   * 재시도 로직을 포함한 API 호출
   */
  private async retryApiCall<T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T | null> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall();
      } catch (error: any) {
        logger.warn(`API call failed (attempt ${i + 1}/${maxRetries}):`, error.message);
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }
    
    return null;
  }
}