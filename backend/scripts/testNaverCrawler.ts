import { NaverFinanceService } from '../src/services/naverFinanceService';

async function testNaverCrawler() {
  const service = new NaverFinanceService();
  
  console.log('Testing Naver Finance Crawler...\n');
  
  try {
    // Test Samsung Electronics
    console.log('1. Testing Samsung Electronics (005930):');
    const samsung = await service.getStockPrice('005930');
    console.log(samsung);
    
    if (samsung) {
      console.log(`\n실제 가격: ${samsung.currentPrice.toLocaleString()}원`);
      console.log(`전일 대비: ${samsung.change.toLocaleString()}원 (${samsung.changePercent.toFixed(2)}%)`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testNaverCrawler();