const { chromium } = require('playwright');

async function testTradingError() {
  console.log('Starting Playwright test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // 1초씩 천천히 실행
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 콘솔 로그 모든 것 수집
    page.on('console', msg => {
      console.log(`[BROWSER ${msg.type()}]: ${msg.text()}`);
    });

    // 네트워크 요청/응답 모니터링
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`[REQUEST] ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', async response => {
      if (response.url().includes('/api/trading/')) {
        console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
        try {
          const responseBody = await response.text();
          console.log(`[RESPONSE BODY] ${responseBody}`);
        } catch (e) {
          console.log('[RESPONSE BODY] Could not read response body');
        }
      }
    });

    console.log('Navigating to website...');
    // 실제 프로덕션 사이트
    await page.goto('https://xn--289aykm66cwye.com', { waitUntil: 'networkidle' });
    
    console.log('Looking for login link...');
    // 로그인 링크 찾기
    const loginLink = page.locator('a:has-text("로그인"), a[href*="login"], button:has-text("로그인")').first();
    await loginLink.click();
    
    await page.waitForTimeout(2000);
    
    console.log('Attempting to login...');
    // 로그인 시도 (실제 계정 필요)
    await page.fill('input[type="email"], input[name="email"]', 'student@example.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    
    const loginButton = page.locator('button:has-text("로그인"), button[type="submit"]').first();
    await loginButton.click();
    
    await page.waitForTimeout(3000);
    
    // 로그인 실패 시 스킵하고 직접 거래 페이지로
    console.log('Navigating to trading page...');
    await page.goto('https://xn--289aykm66cwye.com/trading', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(2000);
    
    console.log('Looking for stock cards...');
    // 주식 카드 찾기
    const stockCard = page.locator('[class*="stock"], .card, [data-testid*="stock"]').first();
    if (await stockCard.count() > 0) {
      await stockCard.click();
      console.log('Stock card clicked');
    }
    
    await page.waitForTimeout(1000);
    
    console.log('Looking for buy button...');
    // 매수 버튼 찾기
    const buyButton = page.locator('button:has-text("매수"), button:has-text("Buy")').first();
    if (await buyButton.count() > 0) {
      await buyButton.click();
      console.log('Buy button clicked');
    }
    
    await page.waitForTimeout(1000);
    
    console.log('Filling trade form...');
    // 거래 폼 채우기
    const quantityInput = page.locator('input[type="number"], input[placeholder*="수량"]').first();
    if (await quantityInput.count() > 0) {
      await quantityInput.fill('1');
    }
    
    const reasonInput = page.locator('textarea, input[placeholder*="근거"]').first();
    if (await reasonInput.count() > 0) {
      await reasonInput.fill('테스트 거래');
    }
    
    console.log('Looking for confirm button...');
    // 확인 버튼 찾기
    const confirmButton = page.locator('button:has-text("확인"), button:has-text("주문")').first();
    if (await confirmButton.count() > 0) {
      console.log('Clicking confirm button...');
      await confirmButton.click();
    }
    
    // 결과 대기
    await page.waitForTimeout(5000);
    
    console.log('Checking for toast messages...');
    // 토스트 메시지 확인
    const toasts = await page.locator('[class*="toast"], [class*="notification"], .Toastify__toast').allTextContents();
    console.log('Toast messages found:', toasts);
    
    console.log('Test completed');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await page.waitForTimeout(5000); // 결과 확인을 위해 5초 대기
    await browser.close();
  }
}

testTradingError().catch(console.error);