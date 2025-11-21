import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { prisma } from '../config/database';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import { getStockPriceCollector } from '../jobs/stockPriceCollector';
import { AggregatedStockService } from '../services/aggregatedStockService';
import { DatabaseStockService } from '../services/databaseStockService';
import { CrawlerStockService } from '../services/crawlerStockService';
import { logger } from '../utils/logger'에러가 발생했습니다'005930', name: '삼성전자', market: 'KOSPI', sector: '전기전자' },
  { symbol: '000660', name: 'SK하이닉스', market: 'KOSPI', sector: '전기전자' },
  { symbol: '005380', name: '현대차', market: 'KOSPI', sector: '자동차' },
  { symbol: '035420', name: 'NAVER', market: 'KOSPI', sector: '서비스업' },
  { symbol: '005490', name: 'POSCO홀딩스', market: 'KOSPI', sector: '철강금속' },
  { symbol: '051910', name: 'LG화학', market: 'KOSPI', sector: '화학' },
  { symbol: '006400', name: '삼성SDI', market: 'KOSPI', sector: '전기전자' },
  { symbol: '068270', name: '셀트리온', market: 'KOSPI', sector: '의약품' },
  { symbol: '105560', name: 'KB금융', market: 'KOSPI', sector: '금융업' },
  { symbol: '055550', name: '신한지주', market: 'KOSPI', sector: '금융업' },
  { symbol: '003670', name: '포스코퓨처엠', market: 'KOSPI', sector: '화학' },
  { symbol: '012330', name: '현대모비스', market: 'KOSPI', sector: '자동차' },
  { symbol: '207940', name: '삼성바이오로직스', market: 'KOSPI', sector: '의약품' },
  { symbol: '017670', name: 'SK텔레콤', market: 'KOSPI', sector: '통신업' },
  { symbol: '030200', name: 'KT', market: 'KOSPI', sector: '통신업' },
  { symbol: '035720', name: '카카오', market: 'KOSPI', sector: '서비스업' },
  { symbol: '003550', name: 'LG', market: 'KOSPI', sector: '기타금융' },
  { symbol: '034730', name: 'SK', market: 'KOSPI', sector: '기타금융' },
  { symbol: '015760', name: '한국전력', market: 'KOSPI', sector: '전기가스업' },
  { symbol: '032830', name: '삼성생명', market: 'KOSPI', sector: '보험' },
  { symbol: '018260', name: '삼성에스디에스', market: 'KOSPI', sector: '서비스업' },
  { symbol: '009150', name: '삼성전기', market: 'KOSPI', sector: '전기전자' },
  { symbol: '000270', name: '기아', market: 'KOSPI', sector: '자동차' },
  { symbol: '036460', name: '한국가스공사', market: 'KOSPI', sector: '전기가스업' },
  { symbol: '010130', name: '고려아연', market: 'KOSPI', sector: '철강금속' },
  
  // KOSPI Mid Cap
  { symbol: '066570', name: 'LG전자', market: 'KOSPI', sector: '전기전자' },
  { symbol: '011200', name: 'HMM', market: 'KOSPI', sector: '운수창고업' },
  { symbol: '009540', name: '현대중공업', market: 'KOSPI', sector: '기계' },
  { symbol: '000810', name: '삼성화재', market: 'KOSPI', sector: '보험' },
  { symbol: '010950', name: 'S-Oil', market: 'KOSPI', sector: '화학' },
  { symbol: '096770', name: 'SK이노베이션', market: 'KOSPI', sector: '화학' },
  { symbol: '034220', name: 'LG디스플레이', market: 'KOSPI', sector: '전기전자' },
  { symbol: '086790', name: '하나금융지주', market: 'KOSPI', sector: '금융업' },
  { symbol: '033780', name: 'KT&G', market: 'KOSPI', sector: '음식료품' },
  { symbol: '000720', name: '현대건설', market: 'KOSPI', sector: '건설업' },
  
  // KOSDAQ Large Cap
  { symbol: '035760', name: 'CJ ENM', market: 'KOSDAQ', sector: '서비스업' },
  { symbol: '036570', name: '엔씨소프트', market: 'KOSDAQ', sector: '서비스업' },
  { symbol: '251270', name: '넷마블', market: 'KOSDAQ', sector: '서비스업' },
  { symbol: '263750', name: '펄어비스', market: 'KOSDAQ', sector: '서비스업' },
  { symbol: '293490', name: '카카오게임즈', market: 'KOSDAQ', sector: '서비스업' },
  { symbol: '041510', name: '에스엠', market: 'KOSDAQ', sector: '서비스업' },
  { symbol: '352820', name: '하이브', market: 'KOSDAQ', sector: '서비스업' },
  { symbol: '112040', name: '위메이드', market: 'KOSDAQ', sector: '서비스업' },
  { symbol: '095660', name: '네오위즈', market: 'KOSDAQ', sector: '서비스업' },
  { symbol: '357780', name: '솔브레인', market: 'KOSDAQ', sector: '화학' },
  { symbol: '247540', name: '에코프로비엠', market: 'KOSDAQ', sector: '화학' },
  { symbol: '086520', name: '에코프로', market: 'KOSDAQ', sector: '화학' },
  { symbol: '328130', name: 'HLB', market: 'KOSDAQ', sector: '의약품' },
  { symbol: '091990', name: '셀트리온헬스케어', market: 'KOSDAQ', sector: '의약품' },
  { symbol: '145020', name: '휴젤', market: 'KOSDAQ', sector: '의약품' },
  
  // Popular stocks for education
  { symbol: '005935', name: '삼성전자우', market: 'KOSPI', sector: '전기전자' },
  { symbol: '373220', name: '엘지에너지솔루션', market: 'KOSPI', sector: '전기전자' },
  { symbol: '051900', name: 'LG생활건강', market: 'KOSPI', sector: '화학' },
  { symbol: '000100', name: '유한양행', market: 'KOSPI', sector: '의약품' },
  { symbol: '028260', name: '삼성물산', market: 'KOSPI', sector: '유통업'에러가 발생했습니다'string'에러가 발생했습니다'insensitive' } },
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { sector: { contains: searchTerm, mode: 'insensitive' } }
    ];
  }
  
  // Filter by market
  if (market && typeof market === 'string'에러가 발생했습니다'desc' },
      { name: 'asc'에러가 발생했습니다'TEACHER' && req.user.role !== 'ADMIN') {
    return next(new AppError('🏫 선생님만 종목을 추가할 수 있습니다.\n\n' +
      '💡 학생 계정으로는 이 기능을 사용할 수 없어요.'에러가 발생했습니다'📈 종목을 찾을 수 없습니다.\n\n' +
      '🔍 종목 코드를 다시 확인해주세요.'에러가 발생했습니다'🚫 이미 등록된 종목입니다.\n\n' +
      '💡 다른 종목 코드를 사용해주세요.'에러가 발생했습니다'💹 주식 가격 정보를 가져올 수 없습니다.\n\n' +
      '⏱️ 잠시 후 다시 시도해주세요.'에러가 발생했습니다'TEACHER' && req.user.role !== 'ADMIN') {
    return next(new AppError('🏫 선생님만 종목 추적을 관리할 수 있습니다.\n\n' +
      '💡 학생 계정으로는 이 기능을 사용할 수 없어요.'에러가 발생했습니다'📈 종목을 찾을 수 없습니다.\n\n' +
      '🔍 종목 코드를 다시 확인해주세요.'에러가 발생했습니다'enabled' : 'disabled'에러가 발생했습니다'asc'에러가 발생했습니다'TEACHER' && req.user.role !== 'ADMIN') {
    return next(new AppError('🏫 선생님만 가격 업데이트를 실행할 수 있습니다.\n\n' +
      '💡 학생 계정으로는 이 기능을 사용할 수 없어요.'에러가 발생했습니다'Manual price collection failed:', error);
  });
  
  res.status(200).json({
    success: true,
    message: 'Price collection started in background'에러가 발생했습니다'📈 종목을 찾을 수 없습니다.\n\n' +
      '🔍 종목 코드를 다시 확인해주세요.'에러가 발생했습니다'asc'에러가 발생했습니다'TEACHER' && req.user.role !== 'ADMIN') {
    return next(new AppError('🏫 선생님만 주식 가격을 업데이트할 수 있습니다.\n\n' +
      '💡 학생 계정으로는 이 기능을 사용할 수 없어요.'에러가 발생했습니다'📈 종목을 찾을 수 없습니다.\n\n' +
      '🔍 종목 코드를 다시 확인해주세요.'에러가 발생했습니다'💹 주식 가격 업데이트에 실패했습니다.\n\n' +
      '⏱️ 잠시 후 다시 시도해주세요.'에러가 발생했습니다'Stock price updated successfully'에러가 발생했습니다'TEACHER' && req.user.role !== 'ADMIN') {
    return next(new AppError('🏫 선생님만 주식 데이터 수집을 실행할 수 있습니다.\n\n' +
      '💡 학생 계정으로는 이 기능을 사용할 수 없어요.'에러가 발생했습니다'Stock crawling failed:', error);
  });
  
  res.status(200).json({
    success: true,
    message: 'Stock crawling started in background'
  });
});