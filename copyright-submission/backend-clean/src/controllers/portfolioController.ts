import { Response, NextFunction } from 'express';
import { PortfolioService } from '../services/portfolioService';
import { AuthRequest } from '../middleware/auth'에러가 발생했습니다'1M'에러가 발생했습니다'1M' } = req.query;
    
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