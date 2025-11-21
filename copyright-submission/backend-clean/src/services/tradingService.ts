import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { TransactionType } from '@prisma/client';
import { AggregatedStockService } from './aggregatedStockService';
import { logger } from '../utils/logger'에러가 발생했습니다'사용자를 찾을 수 없습니다.\n\n' +
          '다시 로그인해주세요.', 404);
      }

      if (!stock) {
        throw new AppError('종목을 찾을 수 없습니다.\n\n' +
          '종목 코드를 다시 확인해주세요.'에러가 발생했습니다'현재 가격 정보를 불러올 수 없습니다.\n\n' +
          '잠시 후 다시 시도해주세요.\n' +
          '주식 시장이 열려있는 시간인지 확인해주세요.'에러가 발생했습니다'투자 금액이 부족합니다.\n\n'에러가 발생했습니다'더 작은 수량으로 거래해보세요!'에러가 발생했습니다'사용자를 찾을 수 없습니다.\n\n' +
          '다시 로그인해주세요.', 404);
      }

      if (!stock) {
        throw new AppError('종목을 찾을 수 없습니다.\n\n' +
          '종목 코드를 다시 확인해주세요.'에러가 발생했습니다'현재 가격 정보를 불러올 수 없습니다.\n\n' +
          '잠시 후 다시 시도해주세요.\n' +
          '주식 시장이 열려있는 시간인지 확인해주세요.'에러가 발생했습니다'보유 수량이 부족합니다.\n\n'에러가 발생했습니다'보유한 수량만큼만 매도할 수 있어요!'에러가 발생했습니다'desc' },
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