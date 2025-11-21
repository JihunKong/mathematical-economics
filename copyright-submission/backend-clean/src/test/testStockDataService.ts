import { StockDataService } from '../services/stockDataService';
import { logger } from '../utils/logger'에러가 발생했습니다'005930');
    if (samsungPrice) {
            );
      );
       + '%');
      );
          }

        const skPrice = await stockService.getStockPrice('000660');
    if (skPrice) {
            );
       + '%');
    }

    // 2. 차트 데이터 조회 (네이버 + KRX 결합)
    ...');
    const chartData = await stockService.getHistoricalData('005930', '1M'에러가 발생했습니다'005930', '000660', '035720', '005380', '051910'에러가 발생했습니다');
    const weeklyChart = await stockService.getHistoricalData('005930', '6M'에러가 발생했습니다'005930'에러가 발생했습니다'005930'에러가 발생했습니다' : 
                              '  1. 네이버 (전일 종가) → 2. Yahoo → 3. Mock');

    
  } catch (error: any) {
        logger.error('Stock data service test failed:', error);
  } finally {
    // 캐시 정리
    stockService.clearCache();
  }
}

// 테스트 실행
if (require.main === module) {
  testStockDataService().catch(console.error);
}