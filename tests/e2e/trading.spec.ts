import { test, expect } from '@playwright/test';

test.describe('주식 거래 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 학생으로 로그인
    await page.goto('/login');
    await page.fill('input[type="email"]', 'student@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('주식 목록 조회', async ({ page }) => {
    await page.goto('/trading');
    
    // 주식 목록이 로드되었는지 확인
    await expect(page.locator('.stock-card')).toHaveCount(10, { timeout: 10000 });
    
    // 검색 기능 테스트
    await page.fill('input[placeholder*="검색"]', '삼성전자');
    await expect(page.locator('.stock-card')).toHaveCount(1);
  });

  test('주식 상세 정보 확인', async ({ page }) => {
    await page.goto('/trading');
    
    // 첫 번째 주식 클릭
    await page.click('.stock-card:first-child');
    
    // 상세 페이지로 이동
    await expect(page.url()).toContain('/stocks/');
    await expect(page.locator('h1')).toBeVisible();
    
    // 차트 로드 확인
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('매수 주문 - 관심종목 미선택', async ({ page }) => {
    await page.goto('/trading');
    
    // 매수 버튼 클릭
    await page.click('.stock-card:first-child button:has-text("매수")');
    
    // 에러 메시지 확인
    await expect(page.locator('.toast-error')).toContainText('이 종목은 관심종목에 추가되지 않았습니다');
  });

  test('매수 주문 - 정상 프로세스', async ({ page }) => {
    await page.goto('/trading');
    
    // 관심종목에 추가된 주식 찾기
    const stockCard = page.locator('.stock-card').filter({ has: page.locator('.watchlist-indicator') });
    
    if (await stockCard.count() > 0) {
      await stockCard.first().locator('button:has-text("매수")').click();
      
      // 매수 모달 확인
      await expect(page.locator('.modal-title')).toContainText('매수');
      
      // 수량 입력
      await page.fill('input[name="quantity"]', '10');
      
      // 거래 근거 입력
      await page.fill('textarea[name="reason"]', '기업 실적 개선으로 인한 주가 상승 예상');
      
      // 주문 제출
      await page.click('button:has-text("매수하기")');
      
      // 성공 메시지 또는 24시간 제한 메시지 확인
      const toast = page.locator('.toast');
      await expect(toast).toBeVisible();
    }
  });

  test('매도 주문', async ({ page }) => {
    await page.goto('/portfolio');
    
    // 보유 종목이 있는지 확인
    const holdings = page.locator('.holding-card');
    
    if (await holdings.count() > 0) {
      await holdings.first().locator('button:has-text("매도")').click();
      
      // 매도 모달 확인
      await expect(page.locator('.modal-title')).toContainText('매도');
      
      // 수량 입력
      await page.fill('input[name="quantity"]', '5');
      
      // 거래 근거 입력
      await page.fill('textarea[name="reason"]', '목표 수익률 달성으로 일부 매도');
      
      // 주문 제출
      await page.click('button:has-text("매도하기")');
      
      // 응답 확인
      await expect(page.locator('.toast')).toBeVisible();
    }
  });

  test('24시간 거래 제한 메시지 확인', async ({ page }) => {
    await page.goto('/trading');
    
    // 새로 추가된 종목 찾기 (24시간 이내)
    const newStock = page.locator('.stock-card').filter({ 
      has: page.locator('.new-indicator') 
    });
    
    if (await newStock.count() > 0) {
      await newStock.first().locator('button:has-text("매수")').click();
      
      // 24시간 제한 메시지 확인
      const errorToast = page.locator('.toast-error');
      await expect(errorToast).toBeVisible();
      await expect(errorToast).toContainText('새로 추가된 종목으로 아직 거래할 수 없습니다');
      await expect(errorToast).toContainText('24시간 후에 거래가 가능합니다');
    }
  });
});