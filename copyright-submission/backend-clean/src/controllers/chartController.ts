import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { prisma } from '../config/database';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError'에러가 발생했습니다'1M'에러가 발생했습니다'📊 종목을 찾을 수 없습니다.\n\n' +
      '🔍 종목 코드를 다시 확인해주세요.\n' +
      '💡 정확한 종목 코드를 입력했는지 확인해보세요.'에러가 발생했습니다'1D':
      startDate.setDate(now.getDate() - 1);
      break;
    case '1W':
      startDate.setDate(now.getDate() - 7);
      break;
    case '1M':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case '3M':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case '1Y'에러가 발생했습니다'asc'에러가 발생했습니다'1D' ? 24 : 30; // hourly for 1D, daily for others
    const intervalMs = period === '1D'에러가 발생했습니다'1M', interval = 'daily'에러가 발생했습니다'📊 종목을 찾을 수 없습니다.\n\n' +
      '🔍 종목 코드를 다시 확인해주세요.\n' +
      '💡 정확한 종목 코드를 입력했는지 확인해보세요.'에러가 발생했습니다'1D':
      startDate.setDate(now.getDate() - 1);
      break;
    case '1W':
      startDate.setDate(now.getDate() - 7);
      break;
    case '1M':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case '3M':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case '1Y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case '5Y'에러가 발생했습니다'asc'
    }
  });

  // Group data by interval
  const aggregatedData = priceHistory.map(record => ({
    timestamp: record.timestamp.toISOString(),
    open: record.dayOpen,
    high: record.dayHigh,
    low: record.dayLow,
    close: record.currentPrice,
    volume: Number(record.volume)
  }));

  res.status(200).json({
    success: true,
    data: aggregatedData
  });
});

// Save price snapshot (called periodically)
export const savePriceSnapshot = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  // Get all tracked stocks
  const trackedStocks = await prisma.stock.findMany({
    where: { isTracked: true }
  });

  let savedCount = 0;
  let errorCount = 0;

  for (const stock of trackedStocks) {
    try {
      await prisma.stockPriceHistory.create({
        data: {
          stockId: stock.id,
          symbol: stock.symbol,
          currentPrice: stock.currentPrice,
          previousClose: stock.previousClose,
          dayOpen: stock.dayOpen || stock.currentPrice,
          dayHigh: stock.dayHigh || stock.currentPrice,
          dayLow: stock.dayLow || stock.currentPrice,
          volume: stock.volume || BigInt(0),
          change: stock.currentPrice - stock.previousClose,
          changePercent: ((stock.currentPrice - stock.previousClose) / stock.previousClose) * 100,
          timestamp: new Date()
        }
      });
      savedCount++;
    } catch (error) {
            errorCount++;
    }
  }

  res.status(200).json({
    success: true,
    message: `Price snapshot saved. Success: ${savedCount}, Errors: ${errorCount}`
  });
});