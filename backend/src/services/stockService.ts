import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { StockData, ChartData } from '../types/stock.types';
import { StockDataService } from './stockDataService';

export class StockService {
  private stockDataService: StockDataService;

  constructor() {
    this.stockDataService = new StockDataService();
  }
  async getAllStocks(userId: string, market?: string) {
    try {
      // Get user's class
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { class: true },
      });

      let where: any = { isActive: true };
      if (market) {
        where.market = market;
      }

      // If user is a student with a class, only show allowed stocks
      if (user?.role === 'STUDENT' && user.classId) {
        const allowedStocks = await prisma.allowedStock.findMany({
          where: {
            classId: user.classId,
            isActive: true,
          },
          select: { stockId: true },
        });

        const allowedStockIds = allowedStocks.map(as => as.stockId);
        where.id = { in: allowedStockIds };
      }
      
      const stocks = await prisma.stock.findMany({
        where,
        orderBy: { marketCap: 'desc' },
        take: 100, // Limit to top 100 stocks
      });

      // Return empty array if no stocks found
      if (!stocks || stocks.length === 0) {
        console.log('No stocks found in database. Returning empty array.');
        return [];
      }

      // 실시간 가격 데이터로 업데이트
      const stocksWithRealTimeData = await Promise.all(
        stocks.map(async (stock) => {
          try {
            const realtimeData = await this.stockDataService.getStockPrice(stock.symbol);
            if (realtimeData) {
              return {
                ...stock,
                currentPrice: realtimeData.currentPrice,
                previousClose: realtimeData.previousClose,
                dayOpen: realtimeData.dayOpen,
                dayHigh: realtimeData.dayHigh,
                dayLow: realtimeData.dayLow,
                volume: BigInt(realtimeData.volume),
              };
            }
          } catch (error) {
            console.error(`Failed to get real-time data for ${stock.symbol}:`, error);
          }
          return stock;
        })
      );

      return stocksWithRealTimeData.map(stock => this.formatStockData(stock));
    } catch (error) {
      console.error('Error in getAllStocks:', error);
      return [];
    }
  }

  async searchStocks(userId: string, query: string, market?: string) {
    // Get user's class
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { class: true },
    });

    let where: any = {
      AND: [
        {
          OR: [
            { symbol: { contains: query, mode: 'insensitive' as const } },
            { name: { contains: query, mode: 'insensitive' as const } },
          ],
        },
        { isActive: true },
        market ? { market } : {},
      ],
    };

    // If user is a student with a class, only search allowed stocks
    if (user?.role === 'STUDENT' && user.classId) {
      const allowedStocks = await prisma.allowedStock.findMany({
        where: {
          classId: user.classId,
          isActive: true,
        },
        select: { stockId: true },
      });

      const allowedStockIds = allowedStocks.map(as => as.stockId);
      where.AND.push({ id: { in: allowedStockIds } });
    }

    const stocks = await prisma.stock.findMany({
      where,
      take: 20,
      select: {
        id: true,
        symbol: true,
        name: true,
        market: true,
      },
    });

    return stocks;
  }

  async getStockBySymbol(symbol: string): Promise<StockData> {
    const stock = await prisma.stock.findUnique({
      where: { symbol: symbol.toUpperCase() },
    });

    if (!stock) {
      throw new AppError('Stock not found', 404);
    }

    return this.formatStockData(stock);
  }

  async getStockChart(symbol: string, period: string = '1M'): Promise<ChartData[]> {
    const stock = await prisma.stock.findUnique({
      where: { symbol: symbol.toUpperCase() },
    });

    if (!stock) {
      throw new AppError('Stock not found', 404);
    }

    // stockDataService를 사용하여 과거 데이터 가져오기
    const historicalData = await this.stockDataService.getHistoricalData(
      symbol,
      period as '1D' | '1W' | '1M' | '3M' | '6M' | '1Y'
    );

    if (historicalData.length > 0) {
      return historicalData.map(item => ({
        date: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: BigInt(item.volume),
      }));
    }

    // 데이터가 없는 경우 빈 배열 반환
    return [];
  }

  async updateStockPrice(symbol: string, priceData: Partial<StockData>) {
    const stock = await prisma.stock.update({
      where: { symbol: symbol.toUpperCase() },
      data: {
        currentPrice: priceData.currentPrice,
        dayOpen: priceData.dayOpen,
        dayHigh: priceData.dayHigh,
        dayLow: priceData.dayLow,
        volume: priceData.volume,
      },
    });

    return this.formatStockData(stock);
  }

  private formatStockData(stock: any): StockData {
    // Handle missing price data gracefully
    const currentPrice = stock.currentPrice || 0;
    const previousClose = stock.previousClose || currentPrice || 1;
    const change = currentPrice - previousClose;
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

    return {
      id: stock.id,
      symbol: stock.symbol,
      name: stock.name,
      market: stock.market,
      sector: stock.sector,
      currentPrice: currentPrice,
      previousClose: previousClose,
      dayOpen: stock.dayOpen || currentPrice,
      dayHigh: stock.dayHigh || currentPrice,
      dayLow: stock.dayLow || currentPrice,
      volume: stock.volume || BigInt(0),
      marketCap: stock.marketCap || BigInt(0),
      per: stock.per || 0,
      eps: stock.eps || 0,
      change,
      changePercent,
    };
  }

  // Mock data for initial development
  async seedMockStocks() {
    const mockStocks = [
      { symbol: '005930', name: '삼성전자', market: 'KOSPI', sector: '전기전자', currentPrice: 75000, previousClose: 74500, marketCap: BigInt('450000000000000') },
      { symbol: '000660', name: 'SK하이닉스', market: 'KOSPI', sector: '전기전자', currentPrice: 135000, previousClose: 134000, marketCap: BigInt('98000000000000') },
      { symbol: '035720', name: '카카오', market: 'KOSPI', sector: 'IT', currentPrice: 58000, previousClose: 57500, marketCap: BigInt('25000000000000') },
      { symbol: '035420', name: 'NAVER', market: 'KOSPI', sector: 'IT', currentPrice: 215000, previousClose: 213000, marketCap: BigInt('35000000000000') },
      { symbol: '005380', name: '현대자동차', market: 'KOSPI', sector: '자동차', currentPrice: 185000, previousClose: 183000, marketCap: BigInt('39000000000000') },
      { symbol: '051910', name: 'LG화학', market: 'KOSPI', sector: '화학', currentPrice: 480000, previousClose: 475000, marketCap: BigInt('34000000000000') },
      { symbol: '006400', name: '삼성SDI', market: 'KOSPI', sector: '전기전자', currentPrice: 430000, previousClose: 428000, marketCap: BigInt('30000000000000') },
      { symbol: '003670', name: '포스코', market: 'KOSPI', sector: '철강', currentPrice: 265000, previousClose: 263000, marketCap: BigInt('23000000000000') },
      { symbol: '105560', name: 'KB금융', market: 'KOSPI', sector: '금융', currentPrice: 52000, previousClose: 51500, marketCap: BigInt('21000000000000') },
      { symbol: '055550', name: '신한지주', market: 'KOSPI', sector: '금융', currentPrice: 38000, previousClose: 37800, marketCap: BigInt('20000000000000') },
    ];

    for (const stockData of mockStocks) {
      await prisma.stock.upsert({
        where: { symbol: stockData.symbol },
        update: stockData,
        create: stockData,
      });
    }
  }
}