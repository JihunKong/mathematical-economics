import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

// Middleware to check if student has selected watchlist
export const requireWatchlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Skip check for non-students (teachers, admins)
    if (userRole !== 'STUDENT') {
      return next();
    }

    // Check if student has selected watchlist
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        hasSelectedWatchlist: true,
        role: true 
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    if (!user.hasSelectedWatchlist) {
      return res.status(403).json({
        success: false,
        message: '거래를 시작하기 전에 관심종목을 선택해주세요!\n\n' +
                 '안내사항:\n' +
                 '• 최대 10개의 종목을 선택할 수 있습니다\n' +
                 '• 하루에 한 번만 변경할 수 있습니다\n' +
                 '• 선택한 종목만 거래할 수 있습니다\n\n' +
                 '관심종목 설정 방법:\n' +
                 '1. 메뉴에서 "관심종목 설정"을 클릭하세요\n' +
                 '2. 원하는 종목을 최대 10개까지 선택하세요\n' +
                 '3. 저장 후 거래를 시작할 수 있습니다',
        code: 'WATCHLIST_REQUIRED'
      });
    }

    return next();
  } catch (error) {
    logger.error('Error in watchlist guard middleware:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// Check if stock price is fresh (within 24 hours) before trading
export const requireFreshPrice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { symbol, stockId } = req.body;
    
    // Support both symbol and stockId
    const stockIdentifier = symbol || stockId;

    if (!stockIdentifier) {
      return res.status(400).json({
        success: false,
        message: '종목 코드 또는 ID가 필요합니다.'
      });
    }

    const stock = await prisma.stock.findFirst({
      where: symbol ? { symbol } : { id: stockId },
      select: { 
        id: true,
        lastPriceUpdate: true,
        symbol: true,
        name: true 
      }
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: '종목을 찾을 수 없습니다.'
      });
    }

    // Check if price is fresh (within 24 hours)
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (!stock.lastPriceUpdate || stock.lastPriceUpdate < dayAgo) {
      const hoursAgo = stock.lastPriceUpdate 
        ? Math.floor((now.getTime() - stock.lastPriceUpdate.getTime()) / (1000 * 60 * 60))
        : null;
      
      return res.status(423).json({
        success: false,
        message: `${stock.name}(${stock.symbol})의 가격 정보가 오래되어 거래할 수 없습니다.\n\n` +
                 `상세 정보:\n` +
                 `• 마지막 업데이트: ${stock.lastPriceUpdate ? `${hoursAgo}시간 전` : '업데이트 기록 없음'}\n` +
                 `• 거래 가능 조건: 24시간 이내 가격 업데이트 필요\n\n` +
                 `해결 방법:\n` +
                 `1. 잠시 후 가격이 자동 업데이트될 때까지 기다려주세요\n` +
                 `2. 선생님께 해당 종목의 가격 업데이트를 요청해주세요\n` +
                 `3. 다른 최신 가격 정보가 있는 종목을 선택해주세요\n\n` +
                 `참고: 안전한 투자를 위해 최신 가격 정보만 사용합니다`,
        code: 'PRICE_NOT_FRESH',
        data: {
          stockId: stock.id,
          symbol: stock.symbol,
          name: stock.name,
          lastUpdate: stock.lastPriceUpdate,
          hoursAgo: hoursAgo
        }
      });
    }

    // Check if student is allowed to trade this stock
    const user = req.user;
    if (user?.role === 'STUDENT' && user?.classId) {
      const allowedStock = await prisma.allowedStock.findFirst({
        where: {
          classId: user.classId,
          stockId: stock.id,
          isActive: true
        }
      });

      if (!allowedStock) {
        const detailedMessage = `${stock.name}(${stock.symbol}) 종목은 거래가 허용되지 않았습니다.\n\n` +
          `거래 제한 사유:\n` +
          `• 선생님이 해당 종목을 교육용으로 허용하지 않았습니다\n` +
          `• 안전한 학습을 위해 선별된 종목만 거래 가능합니다\n\n` +
          `해결 방법:\n` +
          `1. 허용된 종목 목록에서 다른 종목을 선택해주세요\n` +
          `2. 선생님께 해당 종목의 거래 허용을 요청해주세요\n` +
          `3. 관심종목 설정에서 허용된 종목만 선택하세요\n\n` +
          `참고: 교육 목적상 선생님이 승인한 종목만 거래할 수 있습니다`;
        
        logger.info(`Stock not allowed - User: ${user.id}, Stock: ${stock.symbol}, Message: ${detailedMessage}`);
        
        return res.status(403).json({
          success: false,
          message: detailedMessage,
          code: 'STOCK_NOT_ALLOWED'
        });
      }
    }

    // Add stockId to request body if only symbol was provided
    if (symbol && !stockId) {
      req.body.stockId = stock.id;
    }

    return next();
  } catch (error) {
    logger.error('Error in fresh price middleware:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};