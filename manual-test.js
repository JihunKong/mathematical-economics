const { chromium } = require('playwright');

async function manualTest() {
  console.log('Starting manual test - browser will stay open for 5 minutes');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  // 콘솔 로그 모든 것 수집
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    // 중요한 로그만 필터링
    if (text.includes('Response status') || 
        text.includes('Response data') || 
        text.includes('DIRECT FETCH') ||
        text.includes('Trade failed') ||
        text.includes('error') ||
        text.includes('STOCK_NOT_ALLOWED')) {
      console.log(`[BROWSER ${type.toUpperCase()}]: ${text}`);
    }
  });

  // 네트워크 응답 모니터링 (거래 관련만)
  page.on('response', async response => {
    if (response.url().includes('/api/trading/')) {
      console.log(`\n=== TRADING API RESPONSE ===`);
      console.log(`URL: ${response.url()}`);
      console.log(`Status: ${response.status()}`);
      console.log(`Status Text: ${response.statusText()}`);
      
      try {
        const responseBody = await response.text();
        console.log(`Response Body: ${responseBody}`);
        
        // JSON 파싱 시도
        try {
          const jsonData = JSON.parse(responseBody);
          console.log(`Parsed JSON:`, JSON.stringify(jsonData, null, 2));
          
          if (jsonData.message) {
            console.log(`Message Length: ${jsonData.message.length}`);
            console.log(`Message Content: "${jsonData.message}"`);
          }
          
          if (jsonData.code) {
            console.log(`Error Code: ${jsonData.code}`);
          }
        } catch (parseError) {
          console.log('Could not parse response as JSON');
        }
      } catch (e) {
        console.log('Could not read response body');
      }
      console.log(`=== END RESPONSE ===\n`);
    }
  });

  try {
    console.log('Opening production site...');
    await page.goto('https://xn--289aykm66cwye.com');
    
    console.log('\n========================================');
    console.log('MANUAL TEST INSTRUCTIONS:');
    console.log('1. Login with a valid student account');
    console.log('2. Go to the trading page');
    console.log('3. Try to buy a stock that is NOT allowed');
    console.log('4. Check the console output below');
    console.log('5. The browser will stay open for 5 minutes');
    console.log('========================================\n');
    
    // 5분 동안 브라우저 열어두기
    await page.waitForTimeout(300000); // 5분
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    console.log('\nClosing browser...');
    await browser.close();
  }
}

manualTest().catch(console.error);