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
        tx.user.findUnique({ 
          where: { id: userId },
          include: { class: true }
        }),
        tx.stock.findUnique({ where: { symbol: symbol.toUpperCase() } }),
      ]);

      if (!user) {
        throw new AppError('사용자를 찾을 수 없습니다.\n\n' +
          '다시 로그인해주세요.', 404);
      }

      if (!stock) {
        throw new AppError('종목을 찾을 수 없습니다.\n\n' +
          '종목 코드를 다시 확인해주세요.', 404);
      }

      // Check if student is allowed to trade this stock
      if (user.role === 'STUDENT' && user.classId) {
        const allowedStock = await tx.allowedStock.findFirst({
          where: {
            classId: user.classId,
            stockId: stock.id,
            isActive: true
          }
        });

        if (!allowedStock) {
          const error = new AppError(`${stock.name}(${stock.symbol}) 종목은 거래가 허용되지 않았습니다.\n\n` +
            `거래 제한 사유:\n` +
            `• 선생님이 해당 종목을 교육용으로 허용하지 않았습니다\n` +
            `• 안전한 학습을 위해 선별된 종목만 거래 가능합니다\n\n` +
            `해결 방법:\n` +
            `1. 허용된 종목 목록에서 다른 종목을 선택해주세요\n` +
            `2. 선생님께 해당 종목의 거래 허용을 요청해주세요\n` +
            `3. 관심종목 설정에서 허용된 종목만 선택하세요\n\n` +
            `참고: 교육 목적상 선생님이 승인한 종목만 거래할 수 있습니다`, 403);
          (error as any).code = 'STOCK_NOT_ALLOWED';
          throw error;
        }
      }

      // Check if stock has valid price
      if (!stock.currentPrice || stock.currentPrice <= 0) {
        throw new AppError('현재 가격 정보를 불러올 수 없습니다.\n\n' +
          '잠시 후 다시 시도해주세요.\n' +
          '주식 시장이 열려있는 시간인지 확인해주세요.', 400);
      }

      // Calculate total cost
      const totalCost = stock.currentPrice * quantity;
      const commission = Math.round(totalCost * 0.00015); // 0.015% commission
      const totalAmount = totalCost + commission;

      // Check if user has enough cash
      if (user.currentCash < totalAmount) {
        throw new AppError('투자 금액이 부족합니다.\n\n' +
          `현재 보유 현금: ${user.currentCash.toLocaleString()}원\n` +
          `필요 금액: ${totalAmount.toLocaleString()}원\n` +
          `부족 금액: ${(totalAmount - user.currentCash).toLocaleString()}원\n\n` +
          '더 작은 수량으로 거래해보세요!', 400);
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
        tx.user.findUnique({ 
          where: { id: userId },
          include: { class: true }
        }),
        tx.stock.findUnique({ where: { symbol: symbol.toUpperCase() } }),
      ]);

      if (!user) {
        throw new AppError('사용자를 찾을 수 없습니다.\n\n' +
          '다시 로그인해주세요.', 404);
      }

      if (!stock) {
        throw new AppError('종목을 찾을 수 없습니다.\n\n' +
          '종목 코드를 다시 확인해주세요.', 404);
      }

      // Check if student is allowed to trade this stock
      if (user.role === 'STUDENT' && user.classId) {
        const allowedStock = await tx.allowedStock.findFirst({
          where: {
            classId: user.classId,
            stockId: stock.id,
            isActive: true
          }
        });

        if (!allowedStock) {
          const error = new AppError(`${stock.name}(${stock.symbol}) 종목은 거래가 허용되지 않았습니다.\n\n` +
            `거래 제한 사유:\n` +
            `• 선생님이 해당 종목을 교육용으로 허용하지 않았습니다\n` +
            `• 안전한 학습을 위해 선별된 종목만 거래 가능합니다\n\n` +
            `해결 방법:\n` +
            `1. 허용된 종목 목록에서 다른 종목을 선택해주세요\n` +
            `2. 선생님께 해당 종목의 거래 허용을 요청해주세요\n` +
            `3. 관심종목 설정에서 허용된 종목만 선택하세요\n\n` +
            `참고: 교육 목적상 선생님이 승인한 종목만 거래할 수 있습니다`, 403);
          (error as any).code = 'STOCK_NOT_ALLOWED';
          throw error;
        }
      }

      // Check if stock has valid price
      if (!stock.currentPrice || stock.currentPrice <= 0) {
        throw new AppError('현재 가격 정보를 불러올 수 없습니다.\n\n' +
          '잠시 후 다시 시도해주세요.\n' +
          '주식 시장이 열려있는 시간인지 확인해주세요.', 400);
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
        throw new AppError('보유 수량이 부족합니다.\n\n' +
          `현재 보유 수량: ${holding?.quantity || 0}주\n` +
          `매도 주문 수량: ${quantity}주\n\n` +
          '보유한 수량만큼만 매도할 수 있어요!', 400);
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