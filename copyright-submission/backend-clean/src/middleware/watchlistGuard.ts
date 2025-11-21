import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger'에러가 발생했습니다'STUDENT'에러가 발생했습니다'사용자를 찾을 수 없습니다.'에러가 발생했습니다'거래를 시작하기 전에 관심종목을 선택해주세요!\n\n' +
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
      message: '서버 오류가 발생했습니다.'에러가 발생했습니다'종목 코드 또는 ID가 필요합니다.'에러가 발생했습니다'종목을 찾을 수 없습니다.'에러가 발생했습니다'아직 업데이트 안됨'에러가 발생했습니다'PRICE_NOT_FRESH'에러가 발생했습니다'STUDENT'에러가 발생했습니다'STOCK_NOT_ALLOWED'에러가 발생했습니다'Error in fresh price middleware:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};