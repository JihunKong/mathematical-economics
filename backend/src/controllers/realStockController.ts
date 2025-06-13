import { Request, Response } from 'express';
import { RealStockService } from '../services/realStockService';
import { catchAsync } from '../utils/catchAsync';

const realStockService = new RealStockService();

// 실시간 주식 가격 조회
export const getRealTimePrice = catchAsync(async (req: Request, res: Response) => {
  const { symbol } = req.params;
  
  const stock = await realStockService.updateStockPrice(symbol);
  
  res.json({
    success: true,
    data: stock
  });
});

// 주식 차트 데이터 조회
export const getChartData = catchAsync(async (req: Request, res: Response) => {
  const { symbol } = req.params;
  const { period = '1month' } = req.query;
  
  const chartData = await realStockService.getStockChartData(symbol, period as string);
  
  res.json({
    success: true,
    data: chartData
  });
});

// 주식 차트 이미지 조회
export const getChartImage = catchAsync(async (req: Request, res: Response) => {
  const { symbol } = req.params;
  const { period = 'day' } = req.query;
  
  const imageBase64 = await realStockService.getStockChartImage(
    symbol, 
    period as 'day' | 'week' | 'month' | '3month' | 'year'
  );
  
  res.json({
    success: true,
    data: {
      image: imageBase64
    }
  });
});

// 주식 뉴스 조회
export const getStockNews = catchAsync(async (req: Request, res: Response) => {
  const { symbol } = req.params;
  const { limit = 10 } = req.query;
  
  const news = await realStockService.getStockNews(symbol, parseInt(limit as string));
  
  res.json({
    success: true,
    data: news
  });
});

// 재무 데이터 조회
export const getFinancialData = catchAsync(async (req: Request, res: Response) => {
  const { symbol } = req.params;
  
  const financialData = await realStockService.getFinancialData(symbol);
  
  res.json({
    success: true,
    data: financialData
  });
});

// 호가 정보 조회
export const getOrderbook = catchAsync(async (req: Request, res: Response) => {
  const { symbol } = req.params;
  
  const orderbook = await realStockService.getOrderbook(symbol);
  
  res.json({
    success: true,
    data: orderbook
  });
});

// 인기 종목 조회
export const getPopularStocks = catchAsync(async (req: Request, res: Response) => {
  const { market = 'KOSPI' } = req.query;
  
  const stocks = await realStockService.getPopularStocks(market as 'KOSPI' | 'KOSDAQ');
  
  res.json({
    success: true,
    data: stocks
  });
});

// 한국투자증권 API에서 종목 초기화
export const initializeStock = catchAsync(async (req: Request, res: Response) => {
  const { symbol } = req.body;
  
  const stock = await realStockService.initializeStockFromKIS(symbol);
  
  res.json({
    success: true,
    data: stock
  });
});

// 여러 종목 가격 일괄 업데이트
export const updateMultiplePrices = catchAsync(async (req: Request, res: Response) => {
  const { symbols } = req.body;
  
  if (!Array.isArray(symbols) || symbols.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'symbols array is required'
    });
  }
  
  const result = await realStockService.updateMultipleStockPrices(symbols);
  
  return res.json({
    success: true,
    data: result
  });
});

// 모든 활성 종목 가격 업데이트 (관리자용)
export const updateAllActivePrices = catchAsync(async (_req: Request, res: Response) => {
  // 활성화된 모든 주식 가져오기
  const { prisma } = require('../config/database');
  const activeStocks = await prisma.stock.findMany({
    where: { isActive: true },
    select: { symbol: true }
  });

  const symbols = activeStocks.map((stock: any) => stock.symbol);
  
  if (symbols.length === 0) {
    return res.json({
      success: true,
      message: 'No active stocks found',
      data: { succeeded: 0, failed: 0 }
    });
  }
  
  const result = await realStockService.updateMultipleStockPrices(symbols);
  
  return res.json({
    success: true,
    message: `Updated ${result.succeeded} stocks successfully, ${result.failed} failed`,
    data: result
  });
});