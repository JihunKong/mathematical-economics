import { Response, NextFunction } from 'express';
import { TradingService } from '../services/tradingService';
import { AuthRequest } from '../middleware/auth';
import { TransactionType } from '@prisma/client'에러가 발생했습니다'🎉 매수 주문이 성공적으로 체결되었습니다!'에러가 발생했습니다'💰 매도 주문이 성공적으로 체결되었습니다!',
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