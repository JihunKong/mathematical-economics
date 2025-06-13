import { CrawlerStockService } from '../src/services/crawlerStockService';

async function testCrawlerIntegration() {
  console.log('Testing Crawler Integration...\n');
  
  const crawlerService = new CrawlerStockService();
  
  // Test single stock
  console.log('1. Testing single stock crawl (AAPL)');
  const singleResult = await crawlerService.crawlStockPrice('AAPL');
  
  if (singleResult) {
    console.log('✓ Single stock crawl successful:');
    console.log(`  Symbol: ${singleResult.symbol}`);
    console.log(`  Price: $${singleResult.currentPrice}`);
    console.log(`  Source: ${singleResult.source}`);
  } else {
    console.log('✗ Single stock crawl failed');
  }
  
  // Test multiple stocks
  console.log('\n2. Testing multiple stock crawl (AAPL, MSFT, GOOGL)');
  const multiResults = await crawlerService.crawlMultipleStocks(['AAPL', 'MSFT', 'GOOGL']);
  
  console.log(`✓ Crawled ${multiResults.length} stocks:`);
  multiResults.forEach(stock => {
    console.log(`  ${stock.symbol}: $${stock.currentPrice} from ${stock.source}`);
  });
  
  // Test error handling
  console.log('\n3. Testing error handling with invalid symbol');
  const invalidResult = await crawlerService.crawlStockPrice('INVALID123');
  
  if (!invalidResult || invalidResult.currentPrice === 0) {
    console.log('✓ Properly handled invalid symbol');
  } else {
    console.log('✗ Did not handle invalid symbol correctly');
  }
  
  console.log('\nAll tests completed!');
}

// Run the test
testCrawlerIntegration().catch(console.error);