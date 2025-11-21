import { Response, NextFunction } from 'express';
import { StockService } from '../services/stockService';
import { StockDataService } from '../services/stockDataService';
import { AuthRequest } from '../middleware/auth'에러가 발생했습니다'🔍 검색어를 입력해주세요.'에러가 발생했습니다'1M'에러가 발생했습니다'📊 주식 가격 정보를 가져올 수 없습니다.\n\n' +
          '🔄 잠시 후 다시 시도해주세요.'에러가 발생했습니다'📋 종목 코드 목록이 필요합니다.'에러가 발생했습니다'1M' } = req.query;
    
    const validPeriods = ['1D', '1W', '1M', '3M', '6M', '1Y'에러가 발생했습니다'⏰ 잘못된 기간입니다.\n\n' +
          '📌 사용 가능한 기간:\n' +
          '• 1D (하루)\n' +
          '• 1W (일주일)\n' +
          '• 1M (한 달)\n' +
          '• 3M (세 달)\n' +
          '• 6M (여섯 달)\n' +
          '• 1Y (일 년)'에러가 발생했습니다'1D' | '1W' | '1M' | '3M' | '6M' | '1Y'
    );
    
    res.status(200).json({
      success: true,
      data: historicalData,
    });
  } catch (error) {
    next(error);
  }
};