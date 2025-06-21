const { chromium } = require('playwright');

async function testTradingError() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 콘솔 로그 수집
    page.on('console', msg => {
      console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    });

    // 네트워크 요청 모니터링
    page.on('response', response => {
      if (response.url().includes('/api/trading/')) {
        console.log(`[NETWORK] ${response.request().method()} ${response.url()} - ${response.status()}`);
      }
    });

    // 사이트 접속
    console.log('사이트 접속 중...');
    await page.goto('https://경제수학.com');

    // 로그인 (학생 계정이 필요)
    console.log('로그인 페이지로 이동...');
    await page.click('a[href="/login"]');
    
    // 학생 계정으로 로그인 (실제 계정 정보 필요)
    await page.fill('input[type="email"]', 'student@test.com'); // 실제 학생 계정 이메일
    await page.fill('input[type="password"]', 'password123'); // 실제 비밀번호
    await page.click('button[type="submit"]');

    // 로그인 완료 대기
    await page.waitForTimeout(2000);

    // 주식 거래 페이지로 이동
    console.log('주식 거래 페이지로 이동...');
    await page.goto('https://경제수학.com/trading');
    await page.waitForTimeout(2000);

    // 허용되지 않은 종목 선택 (예: 첫 번째 종목)
    console.log('종목 선택...');
    const stockCards = await page.locator('.stock-card').first();
    await stockCards.click();

    // 매수 버튼 클릭
    console.log('매수 버튼 클릭...');
    await page.click('button:has-text("매수")');

    // 수량 입력
    await page.fill('input[placeholder*="수량"]', '1');

    // 투자 근거 입력
    await page.fill('textarea[placeholder*="근거"]', '테스트 거래');

    // 매수 확인 버튼 클릭
    console.log('매수 확인 버튼 클릭...');
    await page.click('button:has-text("확인")');

    // 에러 메시지 대기 및 확인
    await page.waitForTimeout(3000);

    // 화면의 토스트 메시지 확인
    const toastMessages = await page.locator('[data-testid="toast"], .Toastify__toast, .toast').allTextContents();
    console.log('토스트 메시지들:', toastMessages);

    console.log('테스트 완료');

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
}

// Node.js에서 실행 확인
if (require.main === module) {
  testTradingError().catch(console.error);
}

module.exports = { testTradingError };