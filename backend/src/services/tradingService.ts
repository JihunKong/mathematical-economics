import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { TransactionType } from '@prisma/client';
import { AggregatedStockService } from './aggregatedStockService';
import { logger } from '../utils/logger';
import { PortfolioService } from './portfolioService';
import { LeaderboardService } from './leaderboardService';
import { tradeAnalysisService } from './tradeAnalysisService';

interface TradeData {
  userId: string;
  symbol: string;
  quantity: number;
  type: TransactionType;
  reason?: string;
}

export class TradingService {
  private aggregatedStockService: AggregatedStockService;
  private portfolioService: PortfolioService;
  private leaderboardService: LeaderboardService;

  constructor() {
    this.aggregatedStockService = new AggregatedStockService();
    this.portfolioService = new PortfolioService();
    this.leaderboardService = new LeaderboardService();
  }

  // 거래 후 캐시 무효화
  private async invalidateCaches(userId: string): Promise<void> {
    try {
      // 포트폴리오 캐시 무효화
      await this.portfolioService.invalidatePortfolio(userId);
      // 리더보드 캐시 무효화 (모든 기간)
      await this.leaderboardService.invalidateLeaderboard();
      logger.debug(`Caches invalidated for user: ${userId}`);
    } catch (error) {
      logger.error('Cache invalidation failed:', error);
      // 캐시 무효화 실패해도 거래는 계속 진행
    }
  }
  async executeBuy(data: TradeData) {
    const { userId, symbol, quantity, reason } = data;

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
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

      // Note: Stock permission and fresh price checks are handled by middleware (requireFreshPrice)
      // No need to duplicate the check here

      // Get real-time price for accurate trading
      let currentPrice = stock.currentPrice;
      try {
        const realTimeData = await this.aggregatedStockService.getStockPrice(symbol.toUpperCase());
        if (realTimeData && realTimeData.currentPrice > 0) {
          currentPrice = realTimeData.currentPrice;
          logger.info(`Using real-time price for ${symbol}: ${currentPrice} (DB: ${stock.currentPrice})`);
        } else {
          logger.warn(`Failed to get real-time price for ${symbol}, using DB price: ${stock.currentPrice}`);
        }
      } catch (error) {
        logger.warn(`Real-time price fetch failed for ${symbol}, using DB price:`, error);
      }

      // Check if we have valid price
      if (!currentPrice || currentPrice <= 0) {
        throw new AppError('현재 가격 정보를 불러올 수 없습니다.\n\n' +
          '잠시 후 다시 시도해주세요.\n' +
          '주식 시장이 열려있는 시간인지 확인해주세요.', 400);
      }

      // Calculate total cost with real-time price
      const totalCost = currentPrice * quantity;
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
          price: currentPrice,
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
            currentValue: newQuantity * currentPrice,
            profitLoss: (newQuantity * currentPrice) - newTotalCost,
            profitLossPercent: newTotalCost > 0 ? (((newQuantity * currentPrice) - newTotalCost) / newTotalCost * 100) : 0,
          },
        });
      } else {
        // Create new holding
        await tx.holding.create({
          data: {
            userId,
            stockId: stock.id,
            quantity,
            averagePrice: currentPrice,
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

    // 거래 완료 후 캐시 무효화 (트랜잭션 외부에서 실행)
    await this.invalidateCaches(userId);

    // 거래 근거 분석 저장 (비동기로 실행, 실패해도 거래는 유효)
    if (data.reason) {
      tradeAnalysisService.saveTransactionAnalysis(
        result.transaction.id,
        userId,
        data.reason
      ).catch(err => logger.error('Trade analysis save failed:', err));
    }

    return result;
  }

  async executeSell(data: TradeData) {
    const { userId, symbol, quantity, reason } = data;

    const result = await prisma.$transaction(async (tx) => {
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

      // Note: Stock permission and fresh price checks are handled by middleware (requireFreshPrice)
      // No need to duplicate the check here

      // Get real-time price for accurate trading
      let currentPrice = stock.currentPrice;
      try {
        const realTimeData = await this.aggregatedStockService.getStockPrice(symbol.toUpperCase());
        if (realTimeData && realTimeData.currentPrice > 0) {
          currentPrice = realTimeData.currentPrice;
          logger.info(`Using real-time price for ${symbol}: ${currentPrice} (DB: ${stock.currentPrice})`);
        } else {
          logger.warn(`Failed to get real-time price for ${symbol}, using DB price: ${stock.currentPrice}`);
        }
      } catch (error) {
        logger.warn(`Real-time price fetch failed for ${symbol}, using DB price:`, error);
      }

      // Check if we have valid price
      if (!currentPrice || currentPrice <= 0) {
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
      const totalProceeds = currentPrice * quantity;
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
          price: currentPrice,
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
            currentValue: remainingQuantity * currentPrice,
            profitLoss: (remainingQuantity * currentPrice) - remainingTotalCost,
            profitLossPercent: remainingTotalCost > 0 ? (((remainingQuantity * currentPrice) - remainingTotalCost) / remainingTotalCost * 100) : 0,
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

    // 거래 완료 후 캐시 무효화 (트랜잭션 외부에서 실행)
    await this.invalidateCaches(userId);

    // 거래 근거 분석 저장 (비동기로 실행, 실패해도 거래는 유효)
    if (data.reason) {
      tradeAnalysisService.saveTransactionAnalysis(
        result.transaction.id,
        userId,
        data.reason
      ).catch(err => logger.error('Trade analysis save failed:', err));
    }

    return result;
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