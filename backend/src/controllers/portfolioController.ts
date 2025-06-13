import { Response, NextFunction } from 'express';
import { PortfolioService } from '../services/portfolioService';
import { AuthRequest } from '../middleware/auth';

const portfolioService = new PortfolioService();

export const getPortfolio = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const portfolio = await portfolioService.getPortfolio(userId);

    res.status(200).json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    next(error);
  }
};

export const getHoldings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const holdings = await portfolioService.getHoldings(userId);

    res.status(200).json({
      success: true,
      data: holdings,
    });
  } catch (error) {
    next(error);
  }
};

export const getPortfolioPerformance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { period = '1M' } = req.query;
    
    const performance = await portfolioService.getPortfolioPerformance(
      userId,
      period as string
    );

    res.status(200).json({
      success: true,
      data: performance,
    });
  } catch (error) {
    next(error);
  }
};

export const getValueHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { period = '1M' } = req.query;
    
    const history = await portfolioService.getValueHistory(
      userId,
      period as string
    );

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};