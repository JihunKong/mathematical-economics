import { Response, NextFunction } from 'express';
import { TradingService } from '../services/tradingService';
import { AuthRequest } from '../middleware/auth';
import { TransactionType } from '@prisma/client';

const tradingService = new TradingService();

export const buyStock = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { symbol, quantity, reason } = req.body;
    const userId = req.user!.id;

    const result = await tradingService.executeBuy({
      userId,
      symbol,
      quantity,
      type: TransactionType.BUY,
      reason,
    });

    res.status(200).json({
      success: true,
      message: 'Buy order executed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const sellStock = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { symbol, quantity, reason } = req.body;
    const userId = req.user!.id;

    const result = await tradingService.executeSell({
      userId,
      symbol,
      quantity,
      type: TransactionType.SELL,
      reason,
    });

    res.status(200).json({
      success: true,
      message: 'Sell order executed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;

    const transactions = await tradingService.getTransactionHistory(userId, limit);

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};