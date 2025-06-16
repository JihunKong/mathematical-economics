import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { prisma } from '../config/database';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';

// Get chart data for a stock
export const getStockChartData = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { symbol } = req.params;
  const { period = '1M' } = req.query;

  // Find stock
  const stock = await prisma.stock.findUnique({
    where: { symbol }
  });

  if (!stock) {
    return next(new AppError('Stock not found', 404));
  }

  // Calculate date range based on period
  const now = new Date();
  let startDate = new Date();
  
  switch (period) {
    case '1D':
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
    default:
      startDate.setMonth(now.getMonth() - 1);
  }

  // Get price history
  const priceHistory = await prisma.stockPriceHistory.findMany({
    where: {
      stockId: stock.id,
      timestamp: {
        gte: startDate,
        lte: now
      }
    },
    orderBy: {
      timestamp: 'asc'
    },
    select: {
      currentPrice: true,
      dayOpen: true,
      dayHigh: true,
      dayLow: true,
      volume: true,
      timestamp: true
    }
  });

  // Format data for chart
  const chartData = priceHistory.map(record => ({
    timestamp: record.timestamp.toISOString(),
    open: record.dayOpen,
    high: record.dayHigh,
    low: record.dayLow,
    close: record.currentPrice,
    volume: Number(record.volume)
  }));

  // If no history, create synthetic data from current price
  if (chartData.length === 0) {
    const intervals = period === '1D' ? 24 : 30; // hourly for 1D, daily for others
    const intervalMs = period === '1D' 
      ? 60 * 60 * 1000 // 1 hour
      : 24 * 60 * 60 * 1000; // 1 day

    for (let i = intervals; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * intervalMs));
      const variation = (Math.random() - 0.5) * 0.02; // ±2% variation
      const basePrice = stock.currentPrice * (1 + variation);
      
      chartData.push({
        timestamp: timestamp.toISOString(),
        open: basePrice,
        high: basePrice * (1 + Math.random() * 0.01),
        low: basePrice * (1 - Math.random() * 0.01),
        close: basePrice * (1 + (Math.random() - 0.5) * 0.01),
        volume: Math.floor(Math.random() * 1000000) + 100000
      });
    }
  }

  res.status(200).json({
    success: true,
    data: chartData
  });
});

// Get aggregated chart data (for performance)
export const getAggregatedChartData = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { symbol } = req.params;
  const { period = '1M', interval = 'daily' } = req.query;

  const stock = await prisma.stock.findUnique({
    where: { symbol }
  });

  if (!stock) {
    return next(new AppError('Stock not found', 404));
  }

  // Calculate date range
  const now = new Date();
  let startDate = new Date();
  
  switch (period as string) {
    case '1D':
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
    case '5Y':
      startDate.setFullYear(now.getFullYear() - 5);
      break;
    default:
      startDate.setMonth(now.getMonth() - 1);
  }

  // For now, return the same data as getStockChartData
  // In production, you might want to implement proper aggregation
  const priceHistory = await prisma.stockPriceHistory.findMany({
    where: {
      stockId: stock.id,
      timestamp: {
        gte: startDate,
        lte: now
      }
    },
    orderBy: {
      timestamp: 'asc'
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
          change: stock.change,
          changePercent: stock.changePercent,
          timestamp: new Date()
        }
      });
      savedCount++;
    } catch (error) {
      console.error(`Error saving price history for ${stock.symbol}:`, error);
      errorCount++;
    }
  }

  res.status(200).json({
    success: true,
    message: `Price snapshot saved. Success: ${savedCount}, Errors: ${errorCount}`
  });
});