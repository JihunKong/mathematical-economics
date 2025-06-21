import { Response, NextFunction } from 'express';
import { StockService } from '../services/stockService';
import { StockDataService } from '../services/stockDataService';
import { AuthRequest } from '../middleware/auth';

const stockService = new StockService();
const stockDataService = new StockDataService();

export const getAllStocks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { market } = req.query;
    const userId = req.user!.id;
    const stocks = await stockService.getAllStocks(userId, market as string);
    
    res.status(200).json({
      success: true,
      data: stocks,
    });
  } catch (error) {
    next(error);
  }
};

export const searchStocks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q, market } = req.query;
    const userId = req.user!.id;
    
    if (!q) {
      res.status(400).json({
        success: false,
        message: '🔍 검색어를 입력해주세요.',
      });
      return;
    }

    const stocks = await stockService.searchStocks(userId, q as string, market as string);
    
    res.status(200).json({
      success: true,
      data: stocks,
    });
  } catch (error) {
    next(error);
  }
};

export const getStockBySymbol = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { symbol } = req.params;
    const stock = await stockService.getStockBySymbol(symbol);
    
    res.status(200).json({
      success: true,
      data: stock,
    });
  } catch (error) {
    next(error);
  }
};

export const getStockPrice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { symbol } = req.params;
    const stock = await stockService.getStockBySymbol(symbol);
    
    res.status(200).json({
      success: true,
      data: {
        symbol: stock.symbol,
        price: stock.currentPrice,
        change: stock.change,
        changePercent: stock.changePercent,
        volume: stock.volume,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStockChart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { symbol } = req.params;
    const { period = '1M' } = req.query;
    
    const chartData = await stockService.getStockChart(symbol, period as string);
    
    res.status(200).json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    next(error);
  }
};

export const getRealtimePrice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { symbol } = req.params;
    
    const priceData = await stockDataService.getStockPrice(symbol);
    
    if (!priceData) {
      res.status(404).json({
        success: false,
        message: '📊 주식 가격 정보를 가져올 수 없습니다.\n\n' +
          '🔄 잠시 후 다시 시도해주세요.',
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: priceData,
    });
  } catch (error) {
    next(error);
  }
};

export const getMultiplePrices = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols)) {
      res.status(400).json({
        success: false,
        message: '📋 종목 코드 목록이 필요합니다.',
      });
      return;
    }
    
    const pricesData = await stockDataService.getMultipleStockPrices(symbols);
    
    res.status(200).json({
      success: true,
      data: pricesData,
    });
  } catch (error) {
    next(error);
  }
};

export const getHistoricalData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { symbol } = req.params;
    const { period = '1M' } = req.query;
    
    const validPeriods = ['1D', '1W', '1M', '3M', '6M', '1Y'];
    if (!validPeriods.includes(period as string)) {
      res.status(400).json({
        success: false,
        message: '⏰ 잘못된 기간입니다.\n\n' +
          '📌 사용 가능한 기간:\n' +
          '• 1D (하루)\n' +
          '• 1W (일주일)\n' +
          '• 1M (한 달)\n' +
          '• 3M (세 달)\n' +
          '• 6M (여섯 달)\n' +
          '• 1Y (일 년)',
      });
      return;
    }
    
    const historicalData = await stockDataService.getHistoricalData(
      symbol,
      period as '1D' | '1W' | '1M' | '3M' | '6M' | '1Y'
    );
    
    res.status(200).json({
      success: true,
      data: historicalData,
    });
  } catch (error) {
    next(error);
  }
};