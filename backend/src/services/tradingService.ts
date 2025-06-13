import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { TransactionType } from '@prisma/client';

interface TradeData {
  userId: string;
  symbol: string;
  quantity: number;
  type: TransactionType;
  reason?: string;
}

export class TradingService {
  async executeBuy(data: TradeData) {
    const { userId, symbol, quantity, reason } = data;

    // Start transaction
    return await prisma.$transaction(async (tx) => {
      // Get user and stock
      const [user, stock] = await Promise.all([
        tx.user.findUnique({ where: { id: userId } }),
        tx.stock.findUnique({ where: { symbol: symbol.toUpperCase() } }),
      ]);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (!stock) {
        throw new AppError('Stock not found', 404);
      }

      // Calculate total cost
      const totalCost = stock.currentPrice * quantity;
      const commission = Math.round(totalCost * 0.00015); // 0.015% commission
      const totalAmount = totalCost + commission;

      // Check if user has enough cash
      if (user.currentCash < totalAmount) {
        throw new AppError('Insufficient funds', 400);
      }

      // Update user cash
      await tx.user.update({
        where: { id: userId },
        data: { currentCash: user.currentCash - totalAmount },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          stockId: stock.id,
          type: TransactionType.BUY,
          quantity,
          price: stock.currentPrice,
          totalAmount,
          commission,
          reason,
        },
      });

      // Update or create holding
      const existingHolding = await tx.holding.findUnique({
        where: {
          userId_stockId: {
            userId,
            stockId: stock.id,
          },
        },
      });

      if (existingHolding) {
        // Update existing holding
        const newQuantity = existingHolding.quantity + quantity;
        const newTotalCost = existingHolding.totalCost + totalCost;
        const newAveragePrice = newTotalCost / newQuantity;

        await tx.holding.update({
          where: { id: existingHolding.id },
          data: {
            quantity: newQuantity,
            averagePrice: newAveragePrice,
            totalCost: newTotalCost,
            currentValue: newQuantity * stock.currentPrice,
            profitLoss: (newQuantity * stock.currentPrice) - newTotalCost,
            profitLossPercent: ((newQuantity * stock.currentPrice) - newTotalCost) / newTotalCost * 100,
          },
        });
      } else {
        // Create new holding
        await tx.holding.create({
          data: {
            userId,
            stockId: stock.id,
            quantity,
            averagePrice: stock.currentPrice,
            totalCost,
            currentValue: totalCost,
            profitLoss: 0,
            profitLossPercent: 0,
          },
        });
      }

      // Update portfolio
      await this.updatePortfolio(userId, tx);

      return {
        transaction,
        currentCash: user.currentCash - totalAmount,
      };
    });
  }

  async executeSell(data: TradeData) {
    const { userId, symbol, quantity, reason } = data;

    return await prisma.$transaction(async (tx) => {
      // Get user, stock, and holding
      const [user, stock] = await Promise.all([
        tx.user.findUnique({ where: { id: userId } }),
        tx.stock.findUnique({ where: { symbol: symbol.toUpperCase() } }),
      ]);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (!stock) {
        throw new AppError('Stock not found', 404);
      }

      const holding = await tx.holding.findUnique({
        where: {
          userId_stockId: {
            userId,
            stockId: stock.id,
          },
        },
      });

      if (!holding || holding.quantity < quantity) {
        throw new AppError('Insufficient holdings', 400);
      }

      // Calculate proceeds
      const totalProceeds = stock.currentPrice * quantity;
      const commission = Math.round(totalProceeds * 0.00015); // 0.015% commission
      const netProceeds = totalProceeds - commission;

      // Update user cash
      await tx.user.update({
        where: { id: userId },
        data: { currentCash: user.currentCash + netProceeds },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          stockId: stock.id,
          type: TransactionType.SELL,
          quantity,
          price: stock.currentPrice,
          totalAmount: totalProceeds,
          commission,
          reason,
        },
      });

      // Update holding
      const remainingQuantity = holding.quantity - quantity;
      
      if (remainingQuantity === 0) {
        // Delete holding if all shares are sold
        await tx.holding.delete({
          where: { id: holding.id },
        });
      } else {
        // Update holding with remaining shares
        const remainingTotalCost = holding.averagePrice * remainingQuantity;
        
        await tx.holding.update({
          where: { id: holding.id },
          data: {
            quantity: remainingQuantity,
            totalCost: remainingTotalCost,
            currentValue: remainingQuantity * stock.currentPrice,
            profitLoss: (remainingQuantity * stock.currentPrice) - remainingTotalCost,
            profitLossPercent: ((remainingQuantity * stock.currentPrice) - remainingTotalCost) / remainingTotalCost * 100,
          },
        });
      }

      // Update portfolio
      await this.updatePortfolio(userId, tx);

      return {
        transaction,
        currentCash: user.currentCash + netProceeds,
        profitLoss: (stock.currentPrice - holding.averagePrice) * quantity,
      };
    });
  }

  async getTransactionHistory(userId: string, limit = 50) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        stock: {
          select: {
            symbol: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return transactions;
  }

  private async updatePortfolio(userId: string, tx: any) {
    // Get all holdings
    const holdings = await tx.holding.findMany({
      where: { userId },
    });

    // Calculate total portfolio value
    const totalValue = holdings.reduce((sum: number, holding: any) => 
      sum + holding.currentValue, 0
    );
    
    const totalCost = holdings.reduce((sum: number, holding: any) => 
      sum + holding.totalCost, 0
    );

    const totalProfitLoss = totalValue - totalCost;
    const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

    // Update or create portfolio - use findFirst then create or update
    const existingPortfolio = await tx.portfolio.findFirst({
      where: { userId },
    });

    if (existingPortfolio) {
      await tx.portfolio.update({
        where: { id: existingPortfolio.id },
        data: {
          totalValue,
          totalCost,
          totalProfitLoss,
          totalProfitLossPercent,
        },
      });
    } else {
      await tx.portfolio.create({
        data: {
          userId,
          totalValue,
          totalCost,
          totalProfitLoss,
          totalProfitLossPercent,
        },
      });
    }
  }
}