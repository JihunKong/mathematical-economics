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
        message: 'Search query is required',
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
        message: 'Unable to fetch stock price data',
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
        message: 'Symbols array is required',
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
        message: 'Invalid period. Valid periods are: 1D, 1W, 1M, 3M, 6M, 1Y',
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