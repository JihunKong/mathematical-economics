import { NaverFinanceService } from '../src/services/naverFinanceService';

async function testNaverFinance() {
  const service = new NaverFinanceService();
  
  console.log('Testing Naver Finance Service...\n');
  
  try {
    // Test single stock
    console.log('1. Testing single stock (Samsung Electronics - 005930):');
    const samsung = await service.getStockPrice('005930');
    console.log(samsung);
    
    console.log('\n2. Testing multiple stocks:');
    const stocks = await service.getMultipleStockPrices(['005930', '000660', '035420']);
    stocks.forEach(stock => {
      console.log(`${stock.symbol} (${stock.name}): ${stock.currentPrice.toLocaleString()}원`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testNaverFinance();