import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { smartRateLimiter } from '../middleware/smartRateLimiter';
import * as realStockController from '../controllers/realStockController';

const router = Router();

// 모든 사용자가 접근 가능한 엔드포인트
router.use(authenticate);

// 실시간 주식 가격 조회
router.get('/:symbol/price', smartRateLimiter, realStockController.getRealTimePrice);

// 차트 데이터 조회
router.get('/:symbol/chart', smartRateLimiter, realStockController.getChartData);

// 차트 이미지 조회
router.get('/:symbol/chart-image', smartRateLimiter, realStockController.getChartImage);

// 주식 뉴스 조회
router.get('/:symbol/news', smartRateLimiter, realStockController.getStockNews);

// 재무 데이터 조회
router.get('/:symbol/financial', smartRateLimiter, realStockController.getFinancialData);

// 호가 정보 조회
router.get('/:symbol/orderbook', smartRateLimiter, realStockController.getOrderbook);

// 인기 종목 조회
router.get('/popular/list', smartRateLimiter, realStockController.getPopularStocks);

// 교사와 관리자만 접근 가능한 엔드포인트
router.use(authorize('TEACHER', 'ADMIN'));

// 종목 초기화 (한국투자증권 API에서 가져오기)
router.post('/initialize', realStockController.initializeStock);

// 여러 종목 가격 일괄 업데이트
router.post('/update-prices', realStockController.updateMultiplePrices);

// 모든 활성 종목 가격 업데이트
router.post('/update-all-prices', realStockController.updateAllActivePrices);

export default router;