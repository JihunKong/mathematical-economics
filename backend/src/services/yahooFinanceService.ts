import yahooFinance from 'yahoo-finance2';
import { logger } from '../utils/logger';

interface YahooStockData {
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

export class YahooFinanceService {
  private cache = new Map<string, { data: YahooStockData; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds

  // 한국 주식 심볼 변환 (005930 -> 005930.KS)
  private convertToYahooSymbol(symbol: string): string {
    // 이미 .KS 또는 .KQ가 붙어있으면 그대로 반환
    if (symbol.endsWith('.KS') || symbol.endsWith('.KQ')) {
      return symbol;
    }
    
    // KOSDAQ 종목 리스트 (실제로는 더 많은 종목이 있습니다)
    const kosdaqStocks = ['035420', '035720', '036570', '251270', '293490'];
    
    // KOSDAQ 종목이면 .KQ, 아니면 .KS
    if (kosdaqStocks.includes(symbol)) {
      return `${symbol}.KQ`;
    }
    
    return `${symbol}.KS`;
  }

  // 야후 파이낸스를 통한 실시간 주식 가격 조회
  async getStockPrice(symbol: string): Promise<YahooStockData | null> {
    try {
      // 캐시 확인
      const cached = this.cache.get(symbol);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        logger.info(`Returning cached Yahoo data for ${symbol}`);
        return cached.data;
      }

      const yahooSymbol = this.convertToYahooSymbol(symbol);
      logger.info(`Fetching Yahoo Finance data for ${symbol} (${yahooSymbol})`);

      const quote = await yahooFinance.quote(yahooSymbol);
      
      if (!quote) {
        logger.warn(`No data returned from Yahoo Finance for ${yahooSymbol}`);
        return null;
      }

      const stockData: YahooStockData = {
        symbol: symbol, // 원래 심볼로 저장
        name: (quote as any).longName || (quote as any).shortName || '',
        currentPrice: (quote as any).regularMarketPrice || 0,
        previousClose: (quote as any).previousClose || 0,
        change: (quote as any).regularMarketChange || 0,
        changePercent: (quote as any).regularMarketChangePercent || 0,
        dayOpen: (quote as any).regularMarketOpen || 0,
        dayHigh: (quote as any).regularMarketDayHigh || 0,
        dayLow: (quote as any).regularMarketDayLow || 0,
        volume: (quote as any).regularMarketVolume || 0,
        marketCap: (quote as any).marketCap,
      };

      // 캐시에 저장
      this.cache.set(symbol, { data: stockData, timestamp: Date.now() });

      logger.info(`Successfully fetched stock price from Yahoo for ${symbol}: ${stockData.currentPrice} (prev: ${stockData.previousClose}, change: ${stockData.change})`);
      return stockData;
    } catch (error: any) {
      logger.error(`Failed to fetch stock price from Yahoo for ${symbol}:`, {
        message: error.message,
        code: error.code,
        type: error.type,
      });
      return null;
    }
  }

  // 여러 종목의 가격을 한 번에 조회
  async getMultipleStockPrices(symbols: string[]): Promise<YahooStockData[]> {
    try {
      // Yahoo Finance는 한 번에 여러 종목 조회 지원
      const yahooSymbols = symbols.map(s => this.convertToYahooSymbol(s));
      
      logger.info(`Fetching multiple stocks from Yahoo: ${yahooSymbols.join(', ')}`);
      
      const quotes = await yahooFinance.quote(yahooSymbols);
      
      // quote가 단일 객체인 경우 배열로 변환
      const quotesArray = Array.isArray(quotes) ? quotes : [quotes];
      
      const results: YahooStockData[] = [];
      
      for (let i = 0; i < quotesArray.length; i++) {
        const quote = quotesArray[i];
        const originalSymbol = symbols[i];
        
        if (!quote) continue;
        
        const stockData: YahooStockData = {
          symbol: originalSymbol,
          name: (quote as any).longName || (quote as any).shortName || '',
          currentPrice: (quote as any).regularMarketPrice || 0,
          previousClose: (quote as any).previousClose || 0,
          change: (quote as any).regularMarketChange || 0,
          changePercent: (quote as any).regularMarketChangePercent || 0,
          dayOpen: (quote as any).regularMarketOpen || 0,
          dayHigh: (quote as any).regularMarketDayHigh || 0,
          dayLow: (quote as any).regularMarketDayLow || 0,
          volume: (quote as any).regularMarketVolume || 0,
          marketCap: (quote as any).marketCap,
        };
        
        // 캐시에 저장
        this.cache.set(originalSymbol, { data: stockData, timestamp: Date.now() });
        
        results.push(stockData);
      }
      
      logger.info(`Successfully fetched ${results.length} stocks from Yahoo Finance`);
      return results;
    } catch (error: any) {
      logger.error('Failed to fetch multiple stock prices from Yahoo:', {
        message: error.message,
        code: error.code,
        type: error.type,
      });
      return [];
    }
  }

  // 주식 차트 데이터 조회
  async getHistoricalData(symbol: string, period: string = '1mo') {
    try {
      const yahooSymbol = this.convertToYahooSymbol(symbol);
      
      // period1: 시작일, period2: 종료일
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '1d':
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
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 1);
      }

      const historical = await yahooFinance.historical(yahooSymbol, {
        period1: startDate,
        period2: endDate,
        interval: '1d', // daily data
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