import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class PortfolioService {
  async getPortfolio(userId: string) {
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentCash: true,
        initialCapital: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get portfolio summary - find by userId
    await prisma.portfolio.findFirst({
      where: { userId },
    });

    // Get holdings with current stock prices
    const holdings = await prisma.holding.findMany({
      where: { userId },
      include: {
        stock: {
          select: {
            symbol: true,
            name: true,
            currentPrice: true,
            previousClose: true,
          },
        },
      },
    });

    // Update holdings with current values
    const updatedHoldings = holdings.map(holding => {
      const currentValue = holding.quantity * holding.stock.currentPrice;
      const profitLoss = currentValue - holding.totalCost;
      const profitLossPercent = (profitLoss / holding.totalCost) * 100;
      const dayChange = (holding.stock.currentPrice - holding.stock.previousClose) * holding.quantity;
      const dayChangePercent = ((holding.stock.currentPrice - holding.stock.previousClose) / holding.stock.previousClose) * 100;

      return {
        id: holding.id,
        symbol: holding.stock.symbol,
        name: holding.stock.name,
        quantity: holding.quantity,
        averagePrice: holding.averagePrice,
        currentPrice: holding.stock.currentPrice,
        totalCost: holding.totalCost,
        currentValue,
        profitLoss,
        profitLossPercent,
        dayChange,
        dayChangePercent,
        weight: 0, // Will be calculated later
      };
    });

    // Calculate total portfolio value
    const totalHoldingsValue = updatedHoldings.reduce((sum, holding) => sum + holding.currentValue, 0);
    const totalPortfolioValue = user.currentCash + totalHoldingsValue;
    const totalInvestedAmount = user.initialCapital - user.currentCash + 
      updatedHoldings.reduce((sum, holding) => sum + holding.totalCost, 0);
    const totalProfitLoss = totalPortfolioValue - user.initialCapital;
    const totalProfitLossPercent = (totalProfitLoss / user.initialCapital) * 100;

    // Calculate holdings weights
    updatedHoldings.forEach(holding => {
      holding.weight = (holding.currentValue / totalPortfolioValue) * 100;
    });

    // Calculate daily change
    const dailyChange = updatedHoldings.reduce((sum, holding) => sum + holding.dayChange, 0);
    const dailyChangePercent = totalHoldingsValue > 0 ? 
      (dailyChange / (totalHoldingsValue - dailyChange)) * 100 : 0;

    return {
      cash: user.currentCash,
      totalValue: totalPortfolioValue,
      totalInvestedAmount,
      totalProfitLoss,
      totalProfitLossPercent,
      dailyChange,
      dailyChangePercent,
      holdings: updatedHoldings,
      cashWeight: (user.currentCash / totalPortfolioValue) * 100,
    };
  }

  async getHoldings(userId: string) {
    const holdings = await prisma.holding.findMany({
      where: { userId },
      include: {
        stock: {
          select: {
            symbol: true,
            name: true,
            currentPrice: true,
            market: true,
            sector: true,
          },
        },
      },
    });

    return holdings.map(holding => ({
      id: holding.id,
      symbol: holding.stock.symbol,
      name: holding.stock.name,
      market: holding.stock.market,
      sector: holding.stock.sector,
      quantity: holding.quantity,
      averagePrice: holding.averagePrice,
      currentPrice: holding.stock.currentPrice,
      totalCost: holding.totalCost,
      currentValue: holding.quantity * holding.stock.currentPrice,
      profitLoss: (holding.quantity * holding.stock.currentPrice) - holding.totalCost,
      profitLossPercent: ((holding.quantity * holding.stock.currentPrice) - holding.totalCost) / holding.totalCost * 100,
    }));
  }

  async getPortfolioPerformance(userId: string, period: string = '1M') {
    // This would typically fetch historical portfolio values
    // For now, we'll return mock data
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '1W':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'ALL':
        // Get user creation date
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { createdAt: true },
        });
        if (user) {
          startDate.setTime(user.createdAt.getTime());
        }
        break;
    }

    // In a real implementation, you would track portfolio value history
    // For now, return mock performance data
    const portfolio = await this.getPortfolio(userId);
    
    return {
      currentValue: portfolio.totalValue,
      startValue: 1000000, // Initial capital
      absoluteReturn: portfolio.totalProfitLoss,
      percentReturn: portfolio.totalProfitLossPercent,
      period,
      startDate,
      endDate,
    };
  }

  async getValueHistory(_userId: string, period: string = '1M') {
    // This would typically return historical portfolio values
    // For now, we'll generate mock data
    const days = period === '1W' ? 7 : period === '1M' ? 30 : 90;
    const history = [];
    const baseValue = 1000000;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate random fluctuation
      const randomChange = (Math.random() - 0.5) * 0.02; // ±2% daily change
      const value = baseValue * (1 + randomChange * (days - i) / days);
      
      history.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value),
      });
    }

    return history;
  }
}