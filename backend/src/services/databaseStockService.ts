import { prisma } from '../config/database';
import { logger } from '../utils/logger';

interface DatabaseStockData {
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

export class DatabaseStockService {
  // 데이터베이스에서 주식 가격 조회
  async getStockPrice(symbol: string): Promise<DatabaseStockData | null> {
    try {
      // 먼저 Stock 테이블에서 현재 가격 조회
      const stock = await prisma.stock.findUnique({
        where: { symbol }
      });

      if (!stock) {
        logger.warn(`Stock ${symbol} not found in database`);
        return null;
      }

      // 최신 가격 히스토리가 있으면 사용
      const latestHistory = await prisma.stockPriceHistory.findFirst({
        where: { symbol },
        orderBy: { timestamp: 'desc' }
      });

      if (latestHistory) {
        // 10분 이내의 데이터만 사용
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        if (latestHistory.timestamp > tenMinutesAgo) {
          return {
            symbol: stock.symbol,
            name: stock.name,
            currentPrice: latestHistory.currentPrice,
            previousClose: latestHistory.previousClose,
            change: latestHistory.change,
            changePercent: latestHistory.changePercent,
            dayOpen: latestHistory.dayOpen,
            dayHigh: latestHistory.dayHigh,
            dayLow: latestHistory.dayLow,
            volume: Number(latestHistory.volume),
            marketCap: stock.marketCap ? Number(stock.marketCap) : undefined
          };
        }
      }

      // 히스토리가 없거나 오래된 경우, Stock 테이블의 데이터 사용
      const change = stock.currentPrice - stock.previousClose;
      const changePercent = stock.previousClose > 0 
        ? (change / stock.previousClose) * 100 
        : 0;

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
        volume: stock.volume ? Number(stock.volume) : 0,
        marketCap: stock.marketCap ? Number(stock.marketCap) : undefined
      };
    } catch (error: any) {
      logger.error(`Failed to get stock price from database for ${symbol}:`, error.message);
      return null;
    }
  }

  // 여러 종목 가격 조회
  async getMultipleStockPrices(symbols: string[]): Promise<DatabaseStockData[]> {
    try {
      const stocks = await prisma.stock.findMany({
        where: {
          symbol: { in: symbols }
        }
      });

      // 최신 가격 히스토리 조회
      const histories = await prisma.stockPriceHistory.findMany({
        where: {
          symbol: { in: symbols }
        },
        orderBy: { timestamp: 'desc' },
        distinct: ['symbol']
      });

      const historyMap = new Map(histories.map(h => [h.symbol, h]));
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

      return stocks.map(stock => {
        const history = historyMap.get(stock.symbol);
        
        // 최신 히스토리가 있고 10분 이내면 사용
        if (history && history.timestamp > tenMinutesAgo) {
          return {
            symbol: stock.symbol,
            name: stock.name,
            currentPrice: history.currentPrice,
            previousClose: history.previousClose,
            change: history.change,
            changePercent: history.changePercent,
            dayOpen: history.dayOpen,
            dayHigh: history.dayHigh,
            dayLow: history.dayLow,
            volume: Number(history.volume),
            marketCap: stock.marketCap ? Number(stock.marketCap) : undefined
          };
        }

        // 아니면 Stock 테이블 데이터 사용
        const change = stock.currentPrice - stock.previousClose;
        const changePercent = stock.previousClose > 0 
          ? (change / stock.previousClose) * 100 
          : 0;

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
          volume: stock.volume ? Number(stock.volume) : 0,
          marketCap: stock.marketCap ? Number(stock.marketCap) : undefined
        };
      });
    } catch (error: any) {
      logger.error('Failed to get multiple stock prices from database:', error.message);
      return [];
    }
  }

  // 주식 가격 수동 업데이트 (교사/관리자용)
  async updateStockPrice(symbol: string, priceData: Partial<DatabaseStockData>): Promise<boolean> {
    try {
      const stock = await prisma.stock.findUnique({
        where: { symbol }
      });

      if (!stock) {
        logger.error(`Stock ${symbol} not found for manual update`);
        return false;
      }

      // Stock 테이블 업데이트
      await prisma.stock.update({
        where: { symbol },
        data: {
          currentPrice: priceData.currentPrice ?? stock.currentPrice,
          previousClose: priceData.previousClose ?? stock.previousClose,
          dayOpen: priceData.dayOpen ?? stock.dayOpen,
          dayHigh: priceData.dayHigh ?? stock.dayHigh,
          dayLow: priceData.dayLow ?? stock.dayLow,
          volume: priceData.volume ? BigInt(priceData.volume) : stock.volume
        }
      });

      // 가격 히스토리 추가
      if (priceData.currentPrice && priceData.previousClose) {
        const change = priceData.currentPrice - priceData.previousClose;
        const changePercent = priceData.previousClose > 0 
          ? (change / priceData.previousClose) * 100 
          : 0;

        await prisma.stockPriceHistory.create({
          data: {
            stockId: stock.id,
            symbol: stock.symbol,
            currentPrice: priceData.currentPrice,
            previousClose: priceData.previousClose,
            dayOpen: priceData.dayOpen ?? priceData.currentPrice,
            dayHigh: priceData.dayHigh ?? priceData.currentPrice,
            dayLow: priceData.dayLow ?? priceData.currentPrice,
            volume: priceData.volume ? BigInt(priceData.volume) : BigInt(0),
            change,
            changePercent,
            source: 'manual',
            timestamp: new Date()
          }
        });
      }

      logger.info(`Stock ${symbol} price manually updated`);
      return true;
    } catch (error: any) {
      logger.error(`Failed to manually update stock price for ${symbol}:`, error.message);
      return false;
    }
  }
}