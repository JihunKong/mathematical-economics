import { prisma } from '../config/database';
// import { KISApiService } from './kisApiService'; // Removed KIS API
// import { StockScraperService } from './stockScraperService'; // Temporarily disabled
// import { NaverFinanceService } from './naverFinanceService'; // Using aggregated service instead
import { AggregatedStockService } from './aggregatedStockService';
import { logger } from '../utils/logger';

export class RealStockService {
  // private kisApi: KISApiService; // Removed KIS API
  // private scraper: StockScraperService; // Temporarily disabled
  private aggregatedService: AggregatedStockService;

  constructor() {
    // this.kisApi = new KISApiService(); // Removed KIS API
    // this.scraper = new StockScraperService(); // Temporarily disabled
    this.aggregatedService = new AggregatedStockService();
  }

  // 실시간 주식 가격 업데이트 (통합 서비스 사용)
  async updateStockPrice(stockCode: string) {
    try {
      // 통합 서비스를 통해 데이터 가져오기
      const priceData = await this.aggregatedService.getStockPrice(stockCode);
      
      if (!priceData) {
        logger.error(`Failed to fetch price data for ${stockCode} from all sources`);
        throw new Error(`Failed to fetch price data for ${stockCode}`);
      }

      // 데이터베이스 업데이트
      const updatedStock = await prisma.stock.update({
        where: { symbol: stockCode },
        data: {
          currentPrice: priceData.currentPrice,
          previousClose: priceData.previousClose,
          dayOpen: priceData.dayOpen,
          dayHigh: priceData.dayHigh,
          dayLow: priceData.dayLow,
          volume: BigInt(priceData.volume),
          updatedAt: new Date()
        }
      });

      // 가격 히스토리 저장
      await prisma.priceHistory.create({
        data: {
          stockId: updatedStock.id,
          date: new Date(),
          open: priceData.currentPrice,
          high: priceData.currentPrice,
          low: priceData.currentPrice,
          close: priceData.currentPrice,
          volume: BigInt(priceData.volume)
        }
      });

      logger.info(`Updated price for ${stockCode}: ${priceData.currentPrice} (change: ${priceData.change})`);
      return updatedStock;
    } catch (error: any) {
      logger.error(`Failed to update stock price for ${stockCode}:`, {
        message: error.message,
        code: error.code,
        status: error.response?.status
      });
      throw error;
    }
  }

  // 여러 종목의 가격을 일괄 업데이트 (통합 서비스 사용)
  async updateMultipleStockPrices(stockCodes: string[]) {
    try {
      // 통합 서비스에서 일괄 조회
      const stockData = await this.aggregatedService.getMultipleStockPrices(stockCodes);
      
      let succeeded = 0;
      let failed = 0;

      // 가져온 데이터로 일괄 업데이트
      const updatePromises = stockData.map(async (priceData) => {
        try {
          await prisma.stock.update({
            where: { symbol: priceData.symbol },
            data: {
              currentPrice: priceData.currentPrice,
              previousClose: priceData.previousClose,
              dayOpen: priceData.dayOpen,
              dayHigh: priceData.dayHigh,
              dayLow: priceData.dayLow,
              volume: BigInt(priceData.volume),
              updatedAt: new Date()
            }
          });

          // 가격 히스토리 저장
          const stock = await prisma.stock.findUnique({
            where: { symbol: priceData.symbol },
            select: { id: true }
          });

          if (stock) {
            await prisma.priceHistory.create({
              data: {
                stockId: stock.id,
                date: new Date(),
                open: priceData.dayOpen,
                high: priceData.dayHigh,
                low: priceData.dayLow,
                close: priceData.currentPrice,
                volume: BigInt(priceData.volume)
              }
            });
          }

          succeeded++;
        } catch (error: any) {
          logger.error(`Failed to update ${priceData.symbol}:`, {
            message: error.message,
            code: error.code
          });
          failed++;
        }
      });

      await Promise.all(updatePromises);

      // 데이터를 가져오지 못한 종목들
      const fetchedSymbols = new Set(stockData.map(d => d.symbol));
      const missingCodes = stockCodes.filter(code => !fetchedSymbols.has(code));
      
      if (missingCodes.length > 0) {
        logger.warn(`Failed to fetch data for ${missingCodes.length} stocks:`, missingCodes);
        failed += missingCodes.length;
      }

      logger.info(`Batch update completed: ${succeeded} succeeded, ${failed} failed`);
      return { succeeded, failed };
    } catch (error: any) {
      logger.error('Batch update failed:', {
        message: error.message,
        code: error.code
      });
      throw error;
    }
  }

  // 주식 차트 데이터 가져오기
  async getStockChartData(stockCode: string, period: string = '1month') {
    try {
      // Use price history from database instead of external API
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '1week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '1month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '1year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 1);
      }

      // Get stock from database
      const stock = await prisma.stock.findUnique({
        where: { symbol: stockCode },
        include: {
          priceHistory: {
            where: {
              date: {
                gte: startDate,
                lte: endDate
              }
            },
            orderBy: {
              date: 'asc'
            }
          }
        }
      });

      if (!stock || stock.priceHistory.length === 0) {
        // Generate fake data for demonstration
        const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const fakeData = [];
        let basePrice = stock?.currentPrice || 50000;
        
        for (let i = 0; i < Math.min(days, 30); i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          
          // Random price variations
          const variation = (Math.random() - 0.5) * 0.02; // ±2% daily variation
          basePrice = basePrice * (1 + variation);
          
          fakeData.push({
            date: date.toISOString().split('T')[0],
            open: Math.round(basePrice * (1 + (Math.random() - 0.5) * 0.01)),
            high: Math.round(basePrice * 1.01),
            low: Math.round(basePrice * 0.99),
            close: Math.round(basePrice),
            volume: Math.floor(Math.random() * 1000000) + 100000
          });
        }
        
        return fakeData;
      }

      return stock.priceHistory.map((item: any) => ({
        date: item.date.toISOString().split('T')[0],
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: Number(item.volume)
      }));
    } catch (error) {
      logger.error(`Failed to get chart data for ${stockCode}:`, error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  // 차트 이미지 가져오기 (스크래핑) - Temporarily disabled
  async getStockChartImage(stockCode: string, _period: 'day' | 'week' | 'month' | '3month' | 'year' = 'day') {
    try {
      // return await this.scraper.getStockChartImage(stockCode, period);
      return { imageUrl: '', error: 'Chart service temporarily disabled' };
    } catch (error) {
      logger.error(`Failed to get chart image for ${stockCode}:`, error);
      throw error;
    }
  }

  // 종목 뉴스 가져오기 - Temporarily disabled
  async getStockNews(stockCode: string, _limit: number = 10) {
    try {
      // return await this.scraper.getStockNews(stockCode, limit);
      return [];
    } catch (error) {
      logger.error(`Failed to get news for ${stockCode}:`, error);
      throw error;
    }
  }

  // 재무 데이터 가져오기 - Temporarily disabled
  async getFinancialData(stockCode: string) {
    try {
      // return await this.scraper.getFinancialData(stockCode);
      return {};
    } catch (error) {
      logger.error(`Failed to get financial data for ${stockCode}:`, error);
      throw error;
    }
  }

  // 실시간 호가 정보 가져오기 (시뮬레이션 데이터)
  async getOrderbook(stockCode: string) {
    try {
      // Get current stock price from database
      const stock = await prisma.stock.findUnique({
        where: { symbol: stockCode },
        select: { currentPrice: true, name: true }
      });

      if (!stock) {
        throw new Error(`Stock ${stockCode} not found`);
      }

      const basePrice = stock.currentPrice;
      
      // Generate fake orderbook data for demonstration
      const asks = Array.from({ length: 10 }, (_, i) => ({
        price: Math.round(basePrice * (1 + (i + 1) * 0.001)), // Slightly higher prices
        volume: Math.floor(Math.random() * 1000) + 100
      }));

      const bids = Array.from({ length: 10 }, (_, i) => ({
        price: Math.round(basePrice * (1 - (i + 1) * 0.001)), // Slightly lower prices
        volume: Math.floor(Math.random() * 1000) + 100
      }));

      return { asks, bids };
    } catch (error) {
      logger.error(`Failed to get orderbook for ${stockCode}:`, error);
      // Return empty orderbook instead of throwing error
      return { asks: [], bids: [] };
    }
  }

  // 주식 정보 초기화 (통합 서비스 사용)
  async initializeStockFromKIS(stockCode: string) {
    try {
      // Use aggregated service to get stock data
      const priceData = await this.aggregatedService.getStockPrice(stockCode);
      
      if (!priceData) {
        throw new Error(`Failed to get stock data for ${stockCode}`);
      }

      // Default market assignment (can be improved with more sophisticated logic)
      const kosdaqStocks = ['035420', '035720', '036570', '251270', '293490'];
      const market = kosdaqStocks.includes(stockCode) ? 'KOSDAQ' : 'KOSPI';

      // 데이터베이스에 저장
      const stock = await prisma.stock.upsert({
        where: { symbol: stockCode },
        update: {
          name: priceData.name,
          market,
          currentPrice: priceData.currentPrice,
          previousClose: priceData.previousClose,
          dayOpen: priceData.dayOpen,
          dayHigh: priceData.dayHigh,
          dayLow: priceData.dayLow,
          volume: BigInt(priceData.volume),
          isActive: true
        },
        create: {
          symbol: stockCode,
          name: priceData.name,
          market,
          currentPrice: priceData.currentPrice,
          previousClose: priceData.previousClose,
          dayOpen: priceData.dayOpen,
          dayHigh: priceData.dayHigh,
          dayLow: priceData.dayLow,
          volume: BigInt(priceData.volume),
          isActive: true
        }
      });

      logger.info(`Initialized stock ${stockCode} (${priceData.name}) from aggregated service`);
      return stock;
    } catch (error) {
      logger.error(`Failed to initialize stock ${stockCode}:`, error);
      throw error;
    }
  }

  // 인기 종목 리스트 가져오기 (데이터베이스에서)
  async getPopularStocks(market: 'KOSPI' | 'KOSDAQ' = 'KOSPI') {
    try {
      // Get popular stocks from database by volume
      const stocks = await prisma.stock.findMany({
        where: {
          market: market,
          isActive: true,
        },
        orderBy: {
          volume: 'desc'
        },
        take: 20,
        select: {
          symbol: true,
          name: true,
          currentPrice: true,
          previousClose: true,
          volume: true,
        }
      });
      
      return stocks.map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.currentPrice,
        change: stock.currentPrice - stock.previousClose,
        changeRate: ((stock.currentPrice - stock.previousClose) / stock.previousClose * 100),
        volume: Number(stock.volume)
      }));
    } catch (error) {
      logger.error(`Failed to get popular stocks for ${market}:`, error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  // 스크래퍼 종료 - Temporarily disabled
  async closeScraper() {
    // await this.scraper.close();
    logger.info('Scraper service disabled');
  }
}