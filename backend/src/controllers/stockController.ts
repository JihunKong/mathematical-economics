import { Response, NextFunction } from 'express';
import { StockService } from '../services/stockService';
import { AuthRequest } from '../middleware/auth';

const stockService = new StockService();

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