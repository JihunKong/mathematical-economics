import { StockDataService } from '../services/stockDataService';
import { logger } from '../utils/logger';

/**
 * 개선된 주식 데이터 서비스 테스트
 */
async function testStockDataService() {
  const stockService = new StockDataService();

  try {
    console.log('=== 주식 데이터 서비스 테스트 시작 ===\n');

    // 1. 단일 종목 실시간 가격 조회 (KRX 우선)
    console.log('1. 삼성전자 실시간 가격 조회...');
    const samsungPrice = await stockService.getStockPrice('005930');
    if (samsungPrice) {
      console.log('종목명:', samsungPrice.name);
      console.log('현재가:', samsungPrice.currentPrice.toLocaleString());
      console.log('전일대비:', samsungPrice.change.toLocaleString());
      console.log('등락률:', samsungPrice.changePercent.toFixed(2) + '%');
      console.log('거래량:', samsungPrice.volume.toLocaleString());
      console.log('타임스탬프:', samsungPrice.timestamp);
    }

    console.log('\n2. SK하이닉스 실시간 가격 조회...');
    const skPrice = await stockService.getStockPrice('000660');
    if (skPrice) {
      console.log('종목명:', skPrice.name);
      console.log('현재가:', skPrice.currentPrice.toLocaleString());
      console.log('등락률:', skPrice.changePercent.toFixed(2) + '%');
    }

    // 2. 차트 데이터 조회 (네이버 + KRX 결합)
    console.log('\n3. 삼성전자 차트 데이터 조회 (1개월)...');
    const chartData = await stockService.getHistoricalData('005930', '1M');
    if (chartData.length > 0) {
      console.log(`차트 데이터 개수: ${chartData.length}개`);
      console.log('최근 5일 데이터:');
      chartData.slice(-5).forEach((data, _index) => {
        console.log(`  ${data.date.toLocaleDateString()}: 종가 ${data.close.toLocaleString()}, 거래량 ${data.volume.toLocaleString()}`);
      });
    }

    // 3. 여러 종목 일괄 조회
    console.log('\n4. 여러 종목 일괄 조회...');
    const symbols = ['005930', '000660', '035720', '005380', '051910'];
    const multipleStocks = await stockService.getMultipleStockPrices(symbols);
    console.log(`조회된 종목 수: ${multipleStocks.length}개`);
    multipleStocks.forEach(stock => {
      console.log(`  ${stock.name}: ${stock.currentPrice.toLocaleString()}원 (${stock.changePercent.toFixed(2)}%)`);
    });

    // 4. 주간 차트 데이터 조회
    console.log('\n5. 삼성전자 주간 차트 데이터 조회 (6개월)...');
    const weeklyChart = await stockService.getHistoricalData('005930', '6M');
    if (weeklyChart.length > 0) {
      console.log(`주간 데이터 개수: ${weeklyChart.length}개`);
      const firstWeek = weeklyChart[0];
      const lastWeek = weeklyChart[weeklyChart.length - 1];
      const totalReturn = ((lastWeek.close - firstWeek.close) / firstWeek.close) * 100;
      console.log(`6개월 수익률: ${totalReturn.toFixed(2)}%`);
    }

    // 5. 캐시 성능 테스트
    console.log('\n6. 캐시 성능 테스트...');
    const startTime = Date.now();
    await stockService.getStockPrice('005930');
    const firstCallTime = Date.now() - startTime;
    
    const cacheStartTime = Date.now();
    await stockService.getStockPrice('005930');
    const cachedCallTime = Date.now() - cacheStartTime;
    
    console.log(`첫 번째 호출 시간: ${firstCallTime}ms`);
    console.log(`캐시된 호출 시간: ${cachedCallTime}ms`);
    console.log(`성능 개선: ${((firstCallTime - cachedCallTime) / firstCallTime * 100).toFixed(2)}%`);

    // 6. 장 마감 시간 처리 테스트
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    const isMarketOpen = (currentHour > 9 || (currentHour === 9 && currentMinute >= 0)) && 
                        (currentHour < 15 || (currentHour === 15 && currentMinute <= 30));
    
    console.log(`\n7. 현재 시장 상태: ${isMarketOpen ? '장중' : '장마감'}`);
    console.log('데이터 소스 우선순위:');
    console.log(isMarketOpen ? '  1. KRX (실시간) → 2. 네이버 → 3. Yahoo → 4. Mock' : 
                              '  1. 네이버 (전일 종가) → 2. Yahoo → 3. Mock');

    console.log('\n=== 테스트 완료 ===');

  } catch (error: any) {
    console.error('테스트 중 오류 발생:', error.message);
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