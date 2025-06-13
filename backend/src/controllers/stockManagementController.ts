import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { prisma } from '../config/database';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import { getStockPriceCollector } from '../jobs/stockPriceCollector';
import { AggregatedStockService } from '../services/aggregatedStockService';
import { DatabaseStockService } from '../services/databaseStockService';
import { CrawlerStockService } from '../services/crawlerStockService';
import { logger } from '../utils/logger';

// Korean stock market data (sample - in production, this would be from a comprehensive database)
const KOREAN_STOCKS = [
  // KOSPI
  { symbol: '005930', name: '삼성전자', market: 'KOSPI', sector: '전기전자' },
  { symbol: '000660', name: 'SK하이닉스', market: 'KOSPI', sector: '전기전자' },
  { symbol: '005380', name: '현대차', market: 'KOSPI', sector: '자동차' },
  { symbol: '035420', name: 'NAVER', market: 'KOSPI', sector: 'IT' },
  { symbol: '005490', name: 'POSCO홀딩스', market: 'KOSPI', sector: '철강' },
  { symbol: '051910', name: 'LG화학', market: 'KOSPI', sector: '화학' },
  { symbol: '006400', name: '삼성SDI', market: 'KOSPI', sector: '전기전자' },
  { symbol: '068270', name: '셀트리온', market: 'KOSPI', sector: '제약' },
  { symbol: '105560', name: 'KB금융', market: 'KOSPI', sector: '금융' },
  { symbol: '055550', name: '신한지주', market: 'KOSPI', sector: '금융' },
  { symbol: '003670', name: '포스코퓨처엠', market: 'KOSPI', sector: '화학' },
  { symbol: '012330', name: '현대모비스', market: 'KOSPI', sector: '자동차' },
  { symbol: '207940', name: '삼성바이오로직스', market: 'KOSPI', sector: '제약' },
  { symbol: '017670', name: 'SK텔레콤', market: 'KOSPI', sector: '통신' },
  { symbol: '030200', name: 'KT', market: 'KOSPI', sector: '통신' },
  // KOSDAQ
  { symbol: '035720', name: '카카오', market: 'KOSDAQ', sector: 'IT' },
  { symbol: '035760', name: 'CJ ENM', market: 'KOSDAQ', sector: '미디어' },
  { symbol: '036570', name: '엔씨소프트', market: 'KOSDAQ', sector: '게임' },
  { symbol: '251270', name: '넷마블', market: 'KOSDAQ', sector: '게임' },
  { symbol: '263750', name: '펄어비스', market: 'KOSDAQ', sector: '게임' },
  { symbol: '293490', name: '카카오게임즈', market: 'KOSDAQ', sector: '게임' },
  { symbol: '041510', name: '에스엠', market: 'KOSDAQ', sector: '엔터' },
  { symbol: '352820', name: '하이브', market: 'KOSDAQ', sector: '엔터' },
  { symbol: '112040', name: '위메이드', market: 'KOSDAQ', sector: '게임' },
  { symbol: '095660', name: '네오위즈', market: 'KOSDAQ', sector: '게임' },
];

// Search stocks
export const searchStocks = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { query, market } = req.query;
  
  let results = KOREAN_STOCKS;
  
  // Filter by search query
  if (query && typeof query === 'string') {
    const searchTerm = query.toLowerCase();
    results = results.filter(stock => 
      stock.symbol.includes(searchTerm) || 
      stock.name.toLowerCase().includes(searchTerm) ||
      stock.sector?.toLowerCase().includes(searchTerm)
    );
  }
  
  // Filter by market
  if (market && typeof market === 'string') {
    results = results.filter(stock => stock.market === market.toUpperCase());
  }
  
  // Check which stocks are already in database
  const existingStocks = await prisma.stock.findMany({
    where: {
      symbol: {
        in: results.map(s => s.symbol)
      }
    },
    select: {
      symbol: true,
      isTracked: true
    }
  });
  
  const existingMap = new Map(existingStocks.map(s => [s.symbol, s]));
  
  // Add status to results
  const enhancedResults = results.map(stock => ({
    ...stock,
    isAdded: existingMap.has(stock.symbol),
    isTracked: existingMap.get(stock.symbol)?.isTracked || false
  }));
  
  res.status(200).json({
    success: true,
    data: enhancedResults
  });
});

// Add stock to database
export const addStock = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { symbol } = req.body;
  
  // Check if user is teacher or admin
  if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
    return next(new AppError('Only teachers and admins can add stocks', 403));
  }
  
  // Find stock info
  const stockInfo = KOREAN_STOCKS.find(s => s.symbol === symbol);
  if (!stockInfo) {
    return next(new AppError('Stock not found', 404));
  }
  
  // Check if already exists
  const existing = await prisma.stock.findUnique({
    where: { symbol }
  });
  
  if (existing) {
    return next(new AppError('Stock already exists', 400));
  }
  
  // Get initial price from service
  const aggregatedService = new AggregatedStockService();
  const priceData = await aggregatedService.getStockPrice(symbol);
  
  if (!priceData) {
    return next(new AppError('Failed to get stock price', 500));
  }
  
  // Create stock
  const stock = await prisma.stock.create({
    data: {
      symbol: stockInfo.symbol,
      name: stockInfo.name,
      market: stockInfo.market,
      sector: stockInfo.sector,
      currentPrice: priceData.currentPrice,
      previousClose: priceData.previousClose,
      dayOpen: priceData.dayOpen,
      dayHigh: priceData.dayHigh,
      dayLow: priceData.dayLow,
      volume: BigInt(priceData.volume || 0),
      isActive: true,
      isTracked: false // Not tracked by default
    }
  });
  
  logger.info(`Stock ${symbol} added by ${req.user.email}`);
  
  res.status(201).json({
    success: true,
    data: stock
  });
});

// Toggle stock tracking
export const toggleStockTracking = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { symbol } = req.params;
  const { isTracked } = req.body;
  
  // Check if user is teacher or admin
  if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
    return next(new AppError('Only teachers and admins can manage stock tracking', 403));
  }
  
  const stock = await prisma.stock.findUnique({
    where: { symbol }
  });
  
  if (!stock) {
    return next(new AppError('Stock not found', 404));
  }
  
  // Update tracking status
  const updated = await prisma.stock.update({
    where: { symbol },
    data: { isTracked }
  });
  
  // Get count of tracked stocks
  const trackedCount = await prisma.stock.count({
    where: { isTracked: true }
  });
  
  logger.info(`Stock ${symbol} tracking ${isTracked ? 'enabled' : 'disabled'} by ${req.user.email}. Total tracked: ${trackedCount}`);
  
  res.status(200).json({
    success: true,
    data: {
      stock: updated,
      totalTracked: trackedCount
    }
  });
});

// Get tracked stocks
export const getTrackedStocks = catchAsync(async (_req: AuthenticatedRequest, res: Response) => {
  const trackedStocks = await prisma.stock.findMany({
    where: {
      isTracked: true
    },
    orderBy: {
      symbol: 'asc'
    }
  });
  
  res.status(200).json({
    success: true,
    data: trackedStocks
  });
});

// Manually trigger price collection
export const triggerPriceCollection = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Check if user is teacher or admin
  if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
    return next(new AppError('Only teachers and admins can trigger price collection', 403));
  }
  
  const collector = getStockPriceCollector();
  
  // Run collection in background
  collector.collectNow().catch(error => {
    logger.error('Manual price collection failed:', error);
  });
  
  res.status(200).json({
    success: true,
    message: 'Price collection started in background'
  });
});

// Get price history for a stock
export const getStockPriceHistory = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { symbol } = req.params;
  const { hours = 24 } = req.query;
  
  const stock = await prisma.stock.findUnique({
    where: { symbol }
  });
  
  if (!stock) {
    return next(new AppError('Stock not found', 404));
  }
  
  const since = new Date();
  since.setHours(since.getHours() - Number(hours));
  
  const history = await prisma.stockPriceHistory.findMany({
    where: {
      stockId: stock.id,
      timestamp: {
        gte: since
      }
    },
    orderBy: {
      timestamp: 'asc'
    },
    select: {
      currentPrice: true,
      change: true,
      changePercent: true,
      volume: true,
      timestamp: true
    }
  });
  
  res.status(200).json({
    success: true,
    data: {
      symbol,
      name: stock.name,
      history
    }
  });
});

// Manually update stock price (teacher/admin only)
export const updateStockPrice = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { symbol } = req.params;
  const { currentPrice, previousClose, dayOpen, dayHigh, dayLow, volume } = req.body;
  
  // Check if user is teacher or admin
  if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
    return next(new AppError('Only teachers and admins can update stock prices', 403));
  }
  
  const stock = await prisma.stock.findUnique({
    where: { symbol }
  });
  
  if (!stock) {
    return next(new AppError('Stock not found', 404));
  }
  
  // Update stock price using database service
  const databaseService = new DatabaseStockService();
  const success = await databaseService.updateStockPrice(symbol, {
    currentPrice,
    previousClose,
    dayOpen,
    dayHigh,
    dayLow,
    volume
  });
  
  if (!success) {
    return next(new AppError('Failed to update stock price', 500));
  }
  
  logger.info(`Stock ${symbol} price manually updated by ${req.user.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Stock price updated successfully'
  });
});

// Crawl stock prices from web
export const crawlStockPrices = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Check if user is teacher or admin
  if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
    return next(new AppError('Only teachers and admins can trigger stock crawling', 403));
  }
  
  const crawlerService = new CrawlerStockService();
  
  // Run crawling in background
  crawlerService.crawlAndUpdateTrackedStocks().then(count => {
    logger.info(`Crawling completed: ${count} stocks updated`);
  }).catch(error => {
    logger.error('Stock crawling failed:', error);
  });
  
  res.status(200).json({
    success: true,
    message: 'Stock crawling started in background'
  });
});