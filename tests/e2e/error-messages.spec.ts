import { test, expect } from '@playwright/test';

test.describe('에러 메시지 한글화 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('로그인 실패 - 한글 에러 메시지', async ({ page }) => {
    await page.goto('/login');
    
    // 잘못된 인증 정보로 로그인 시도
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // 한글 에러 메시지 확인
    const errorToast = page.locator('.toast-error');
    await expect(errorToast).toBeVisible();
    await expect(errorToast).toContainText('이메일 또는 비밀번호가 올바르지 않습니다');
    
    // 이모지가 없는지 확인
    const errorText = await errorToast.textContent();
    expect(errorText).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);
  });

  test('매수 실패 - 관심종목 미등록', async ({ page }) => {
    // 학생으로 로그인
    await page.goto('/login');
    await page.fill('input[type="email"]', 'student@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/trading');
    
    // 관심종목이 아닌 주식 매수 시도
    const nonWatchlistStock = page.locator('.stock-card').filter({
      hasNot: page.locator('.watchlist-indicator')
    });
    
    if (await nonWatchlistStock.count() > 0) {
      await nonWatchlistStock.first().locator('button:has-text("매수")').click();
      
      const errorToast = page.locator('.toast-error');
      await expect(errorToast).toBeVisible();
      await expect(errorToast).toContainText('이 종목은 관심종목에 추가되지 않았습니다');
      await expect(errorToast).toContainText('거래하려면 먼저 관심종목에 추가해주세요');
    }
  });

  test('매수 실패 - 24시간 제한', async ({ page }) => {
    // 학생으로 로그인
    await page.goto('/login');
    await page.fill('input[type="email"]', 'student@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/trading');
    
    // 새로 추가된 종목 찾기
    const newStock = page.locator('.stock-card').filter({
      has: page.locator('.new-badge')
    });
    
    if (await newStock.count() > 0) {
      await newStock.first().locator('button:has-text("매수")').click();
      
      const errorToast = page.locator('.toast-error');
      await expect(errorToast).toBeVisible();
      await expect(errorToast).toContainText('새로 추가된 종목으로 아직 거래할 수 없습니다');
      await expect(errorToast).toContainText('24시간 후에 거래가 가능합니다');
      await expect(errorToast).toContainText('가격 정보 업데이트를 기다려야 합니다');
    }
  });

  test('매수 실패 - 잔액 부족', async ({ page }) => {
    // 학생으로 로그인
    await page.goto('/login');
    await page.fill('input[type="email"]', 'student@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/trading');
    
    // 거래 가능한 주식 찾기
    const tradableStock = page.locator('.stock-card').filter({
      has: page.locator('.watchlist-indicator')
    }).first();
    
    if (await tradableStock.count() > 0) {
      await tradableStock.locator('button:has-text("매수")').click();
      
      // 매수 모달에서 큰 수량 입력
      await page.fill('input[name="quantity"]', '999999');
      await page.fill('textarea[name="reason"]', '테스트 매수');
      await page.click('button:has-text("매수하기")');
      
      const errorToast = page.locator('.toast-error');
      await expect(errorToast).toBeVisible();
      await expect(errorToast).toContainText('잔액이 부족합니다');
      await expect(errorToast).toContainText('현재 잔액');
      await expect(errorToast).toContainText('필요 금액');
    }
  });

  test('매도 실패 - 보유 수량 부족', async ({ page }) => {
    // 학생으로 로그인
    await page.goto('/login');
    await page.fill('input[type="email"]', 'student@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/portfolio');
    
    const holdings = page.locator('.holding-card');
    if (await holdings.count() > 0) {
      await holdings.first().locator('button:has-text("매도")').click();
      
      // 보유 수량보다 많은 수량 입력
      await page.fill('input[name="quantity"]', '999999');
      await page.fill('textarea[name="reason"]', '테스트 매도');
      await page.click('button:has-text("매도하기")');
      
      const errorToast = page.locator('.toast-error');
      await expect(errorToast).toBeVisible();
      await expect(errorToast).toContainText('보유 수량이 부족합니다');
      await expect(errorToast).toContainText('보유 수량');
      await expect(errorToast).toContainText('매도 요청 수량');
    }
  });

  test('서버 오류 - 한글 메시지', async ({ page }) => {
    // 네트워크 차단으로 서버 오류 시뮬레이션
    await page.route('**/api/**', route => route.abort());
    
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    const errorToast = page.locator('.toast-error');
    await expect(errorToast).toBeVisible();
    await expect(errorToast).toContainText('서버 연결에 실패했습니다');
  });

  test('세션 만료 - 한글 메시지', async ({ page }) => {
    // 로그인 후 세션 만료 시뮬레이션
    await page.goto('/login');
    await page.fill('input[type="email"]', 'student@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 토큰 제거로 세션 만료 시뮬레이션
    await page.evaluate(() => {
      localStorage.removeItem('token');
    });
    
    // 인증이 필요한 페이지 접근
    await page.goto('/portfolio');
    
    // 로그인 페이지로 리다이렉트 및 메시지 확인
    await expect(page).toHaveURL('/login');
    const infoToast = page.locator('.toast-info');
    await expect(infoToast).toBeVisible();
    await expect(infoToast).toContainText('세션이 만료되었습니다. 다시 로그인해주세요');
  });
});