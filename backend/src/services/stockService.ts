import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { StockData, ChartData } from '../types/stock.types';

export class StockService {
  async getAllStocks(userId: string, market?: string) {
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

    return stocks.map(stock => this.formatStockData(stock));
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

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
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
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // First try PriceHistory table (daily data)
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

    if (priceHistory.length > 0) {
      return priceHistory.map(item => ({
        date: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
      }));
    }

    // If no PriceHistory data, use StockPriceHistory for recent data
    const stockPriceHistory = await prisma.stockPriceHistory.findMany({
      where: {
        symbol: symbol.toUpperCase(),
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    // Group by day for chart data
    const dailyData = new Map<string, ChartData>();
    
    stockPriceHistory.forEach(item => {
      const dateKey = item.timestamp.toISOString().split('T')[0];
      
      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, {
          date: new Date(dateKey),
          open: item.dayOpen || item.currentPrice,
          high: item.dayHigh || item.currentPrice,
          low: item.dayLow || item.currentPrice,
          close: item.currentPrice,
          volume: BigInt(item.volume),
        });
      } else {
        const existing = dailyData.get(dateKey)!;
        dailyData.set(dateKey, {
          date: existing.date,
          open: existing.open,
          high: Math.max(existing.high, item.dayHigh || item.currentPrice),
          low: Math.min(existing.low, item.dayLow || item.currentPrice),
          close: item.currentPrice, // Use the latest price as close
          volume: existing.volume + BigInt(item.volume),
        });
      }
    });

    return Array.from(dailyData.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
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
    const change = stock.currentPrice - stock.previousClose;
    const changePercent = (change / stock.previousClose) * 100;

    return {
      symbol: stock.symbol,
      name: stock.name,
      market: stock.market,
      sector: stock.sector,
      currentPrice: stock.currentPrice,
      previousClose: stock.previousClose,
      dayOpen: stock.dayOpen,
      dayHigh: stock.dayHigh,
      dayLow: stock.dayLow,
      volume: stock.volume,
      marketCap: stock.marketCap,
      per: stock.per,
      eps: stock.eps,
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