import { DaumFinanceService } from '../src/services/daumFinanceService';

async function testDaumFinance() {
  const service = new DaumFinanceService();
  
  console.log('Testing Daum Finance Service...\n');
  
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

testDaumFinance();