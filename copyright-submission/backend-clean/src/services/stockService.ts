import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { StockData, ChartData } from '../types/stock.types';
import { StockDataService } from './stockDataService'에러가 발생했습니다's class
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { class: true },
      });

      let where: any = { isActive: true };
      if (market) {
        where.market = market;
      }

      
      const stocks = await prisma.stock.findMany({
        where,
        orderBy: { marketCap: 'desc'에러가 발생했습니다's class
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { class: true },
    });

    let where: any = {
      AND: [
        {
          OR: [
            { symbol: { contains: query, mode: 'insensitive' as const } },
            { name: { contains: query, mode: 'insensitive'에러가 발생했습니다'📊 종목을 찾을 수 없습니다.\n\n' +
        '🔍 종목 코드를 다시 확인해주세요.\n' +
        '💡 정확한 종목 코드를 입력했는지 확인해보세요.'에러가 발생했습니다'1M'에러가 발생했습니다'📊 종목을 찾을 수 없습니다.\n\n' +
        '🔍 종목 코드를 다시 확인해주세요.\n' +
        '💡 정확한 종목 코드를 입력했는지 확인해보세요.'에러가 발생했습니다'1D' | '1W' | '1M' | '3M' | '6M' | '1Y'에러가 발생했습니다'005930', name: '삼성전자', market: 'KOSPI', sector: '전기전자', currentPrice: 75000, previousClose: 74500, marketCap: BigInt('450000000000000') },
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