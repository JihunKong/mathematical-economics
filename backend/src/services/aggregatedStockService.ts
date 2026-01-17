import { logger } from '../utils/logger';
import { NaverFinanceService } from './naverFinanceService';
// import { NaverFinanceServiceV2 } from './naverFinanceServiceV2'; // Temporarily disabled due to cheerio issue
import { DaumFinanceService } from './daumFinanceService';
import { YahooFinanceService } from './yahooFinanceService';
import { AlphaVantageService } from './alphaVantageService';
import { KISService } from './kisService';
import { DatabaseStockService } from './databaseStockService';
import { CrawlerStockService } from './crawlerStockService';
import { prisma } from '../config/database';
import {
  getCurrencyFromMarket,
  ensurePriceInKRW,
} from '../config/exchangeRates';

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
  hasRealPrice?: boolean; // Flag to indicate if price is from real source
}

export class AggregatedStockService {
  private naverV1: NaverFinanceService;
  // private naverV2: NaverFinanceServiceV2;
  private daum: DaumFinanceService;
  private yahoo: YahooFinanceService;
  private alphaVantage: AlphaVantageService;
  private kis: KISService;
  private database: DatabaseStockService;
  private crawler: CrawlerStockService;
  private fallbackPriority: string[] = ['crawler', 'database', 'kis']; // Try crawler first for latest prices

  constructor() {
    this.naverV1 = new NaverFinanceService();
    // this.naverV2 = new NaverFinanceServiceV2();
    this.daum = new DaumFinanceService();
    this.yahoo = new YahooFinanceService();
    this.alphaVantage = new AlphaVantageService();
    this.kis = new KISService();
    this.database = new DatabaseStockService();
    this.crawler = new CrawlerStockService();
  }

  // Helper method to convert price data to KRW
  private convertPriceDataToKRW(data: StockPriceData, currency: string): StockPriceData {
    // If already in KRW, return as is
    if (currency === 'KRW') {
      return data;
    }

    // Convert all price fields to KRW
    return {
      ...data,
      currentPrice: ensurePriceInKRW(data.currentPrice, currency),
      previousClose: ensurePriceInKRW(data.previousClose, currency),
      change: ensurePriceInKRW(data.change, currency),
      dayOpen: ensurePriceInKRW(data.dayOpen, currency),
      dayHigh: ensurePriceInKRW(data.dayHigh, currency),
      dayLow: ensurePriceInKRW(data.dayLow, currency),
    };
  }

  // 여러 소스에서 주식 가격 조회 (폴백 전략)
  async getStockPrice(symbol: string): Promise<StockPriceData | null> {
    // First, get stock info from database to determine currency
    const stockInfo = await prisma.stock.findUnique({
      where: { symbol },
      select: { market: true, currency: true },
    });

    // Determine currency - use stored currency or derive from market
    const currency = stockInfo?.currency || (stockInfo ? getCurrencyFromMarket(stockInfo.market) : 'KRW');

    const services = {
      naverV1: () => this.naverV1.getStockPrice(symbol),
      // naverV2: () => this.naverV2.getStockPrice(symbol),
      daum: () => this.daum.getStockPrice(symbol),
      yahoo: () => this.yahoo.getStockPrice(symbol),
      alphaVantage: () => this.alphaVantage.getStockPrice(symbol),
      kis: () => this.kis.getStockPrice(symbol),
      database: () => this.database.getStockPrice(symbol),
      crawler: async () => {
        const result = await this.crawler.crawlStockPrice(symbol);
        if (result) {
          return {
            symbol: result.symbol,
            name: result.name,
            currentPrice: result.currentPrice,
            previousClose: result.previousClose,
            change: result.change,
            changePercent: result.changePercent,
            dayOpen: result.dayOpen,
            dayHigh: result.dayHigh,
            dayLow: result.dayLow,
            volume: result.volume,
            marketCap: undefined,
            hasRealPrice: true
          };
        }
        return null;
      },
    };

    for (const serviceName of this.fallbackPriority) {
      try {
        logger.info(`Trying to fetch ${symbol} from ${serviceName}`);
        let data = await services[serviceName as keyof typeof services]();

        if (data && data.currentPrice > 0) {
          // DB에서 가져온 데이터는 이미 KRW로 저장되어 있으므로 변환 불필요
          // 외부 API에서 가져온 데이터만 변환
          const isFromDatabase = serviceName === 'database';
          if (!isFromDatabase) {
            data = this.convertPriceDataToKRW(data, currency);
          }
          logger.info(`Successfully fetched ${symbol} from ${serviceName} (currency: ${currency}, converted: ${!isFromDatabase})`);
          return { ...data, hasRealPrice: true };
        }
      } catch (error: any) {
        logger.warn(`Failed to fetch from ${serviceName}:`, {
          symbol,
          service: serviceName,
          error: error.message,
        });
        continue;
      }
    }

    // If all services fail, return stock info with zero price (to be updated by teacher)
    logger.warn(`All services failed for ${symbol}, returning stock info without price`);
    const stock = await prisma.stock.findUnique({
      where: { symbol },
      select: {
        symbol: true,
        name: true,
        currentPrice: true,
        previousClose: true,
        dayOpen: true,
        dayHigh: true,
        dayLow: true,
        volume: true,
        marketCap: true,
        updatedAt: true,
      },
    });

    if (stock) {
      // Check if the stock has been updated recently (within 24 hours)
      const hoursSinceUpdate = (Date.now() - stock.updatedAt.getTime()) / (1000 * 60 * 60);
      const hasRealPrice = hoursSinceUpdate < 24 && stock.currentPrice > 0;
      
      return {
        symbol: stock.symbol,
        name: stock.name,
        currentPrice: stock.currentPrice || 0,
        previousClose: stock.previousClose || 0,
        change: stock.currentPrice - stock.previousClose,
        changePercent: stock.previousClose > 0 ? ((stock.currentPrice - stock.previousClose) / stock.previousClose) * 100 : 0,
        dayOpen: stock.dayOpen || 0,
        dayHigh: stock.dayHigh || 0,
        dayLow: stock.dayLow || 0,
        volume: Number(stock.volume) || 0,
        marketCap: stock.marketCap ? Number(stock.marketCap) : undefined,
        hasRealPrice: hasRealPrice
      };
    }

    return null;
  }

  // 여러 종목 가격 일괄 조회
  async getMultipleStockPrices(symbols: string[]): Promise<StockPriceData[]> {
    try {
      // Only use crawler service for real prices
      const results = await Promise.all(
        symbols.map(symbol => this.getStockPrice(symbol))
      );
      
      return results.filter((r): r is StockPriceData => r !== null);
    } catch (error: any) {
      logger.error('Failed to fetch stock prices:', error.message);
      return [];
    }
  }

  // DB에서 마지막 알려진 가격 조회
  async getLastKnownPrice(symbol: string): Promise<StockPriceData | null> {
    try {
      const stock = await prisma.stock.findFirst({
        where: { symbol },
        select: {
          symbol: true,
          name: true,
          currentPrice: true,
          previousClose: true,
          dayOpen: true,
          dayHigh: true,
          dayLow: true,
          volume: true,
          marketCap: true,
          updatedAt: true,
        },
      });

      if (!stock) {
        return null;
      }

      // 24시간 이상 된 데이터는 null 반환
      const hoursSinceUpdate = (Date.now() - stock.updatedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceUpdate > 24) {
        logger.warn(`Stock ${symbol} data is ${hoursSinceUpdate.toFixed(1)} hours old`);
        return null;
      }

      const change = stock.currentPrice - stock.previousClose;
      const changePercent = (change / stock.previousClose) * 100;

      return {
        symbol: stock.symbol,
        name: stock.name,
        currentPrice: stock.currentPrice,
        previousClose: stock.previousClose,
        change,
        changePercent,
        dayOpen: stock.dayOpen || stock.currentPrice,
        dayHigh: stock.dayHigh || stock.currentPrice,
        dayLow: stock.dayLow || stock.currentPrice,
        volume: Number(stock.volume),
        marketCap: stock.marketCap ? Number(stock.marketCap) : undefined,
        hasRealPrice: true
      };
    } catch (error: any) {
      logger.error(`Failed to get last known price for ${symbol}:`, error.message);
      return null;
    }
  }

  // 서비스 우선순위 변경
  setFallbackPriority(priority: string[]) {
    this.fallbackPriority = priority;
  }

  // 캐시 초기화
  clearAllCaches() {
    // if ('clearCache' in this.naverV2) {
    //   this.naverV2.clearCache();
    // }
    if ('clearCache' in this.daum) {
      this.daum.clearCache();
    }
    if ('clearCache' in this.yahoo) {
      this.yahoo.clearCache();
    }
  }
}