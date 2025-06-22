import { test, expect } from '@playwright/test';

test.describe('포트폴리오 관리 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 학생으로 로그인
    await page.goto('/login');
    await page.fill('input[type="email"]', 'student@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('포트폴리오 개요 확인', async ({ page }) => {
    await page.goto('/portfolio');
    
    // 주요 메트릭 확인
    await expect(page.locator('[data-testid="total-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="cash-balance"]')).toBeVisible();
    await expect(page.locator('[data-testid="return-rate"]')).toBeVisible();
    
    // 차트 로드 확인
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('보유 종목 목록 확인', async ({ page }) => {
    await page.goto('/portfolio');
    
    // 보유 종목 섹션
    const holdingsSection = page.locator('[data-testid="holdings-section"]');
    await expect(holdingsSection).toBeVisible();
    
    // 보유 종목이 있다면 상세 정보 확인
    const holdings = holdingsSection.locator('.holding-card');
    const count = await holdings.count();
    
    if (count > 0) {
      const firstHolding = holdings.first();
      await expect(firstHolding.locator('.stock-name')).toBeVisible();
      await expect(firstHolding.locator('.quantity')).toBeVisible();
      await expect(firstHolding.locator('.average-price')).toBeVisible();
      await expect(firstHolding.locator('.current-value')).toBeVisible();
      await expect(firstHolding.locator('.profit-loss')).toBeVisible();
    }
  });

  test('거래 내역 확인', async ({ page }) => {
    await page.goto('/portfolio');
    
    // 거래 내역 탭 클릭
    await page.click('text=거래 내역');
    
    // 거래 내역 테이블 확인
    const transactionTable = page.locator('[data-testid="transaction-table"]');
    await expect(transactionTable).toBeVisible();
    
    // 필터링 테스트
    await page.selectOption('select[name="filter-type"]', 'BUY');
    await expect(transactionTable.locator('tbody tr')).toHaveCount(await transactionTable.locator('tbody tr:has-text("매수")').count());
  });

  test('포트폴리오 성과 분석', async ({ page }) => {
    await page.goto('/portfolio');
    
    // 성과 분석 탭 클릭
    await page.click('text=성과 분석');
    
    // 수익률 차트 확인
    await expect(page.locator('[data-testid="performance-chart"]')).toBeVisible();
    
    // 기간별 수익률 확인
    await expect(page.locator('[data-testid="daily-return"]')).toBeVisible();
    await expect(page.locator('[data-testid="weekly-return"]')).toBeVisible();
    await expect(page.locator('[data-testid="monthly-return"]')).toBeVisible();
  });

  test('포트폴리오 구성 비율 확인', async ({ page }) => {
    await page.goto('/portfolio');
    
    // 구성 비율 섹션 확인
    const compositionSection = page.locator('[data-testid="portfolio-composition"]');
    await expect(compositionSection).toBeVisible();
    
    // 파이 차트 확인
    await expect(compositionSection.locator('canvas')).toBeVisible();
    
    // 레전드 확인
    const legend = compositionSection.locator('.chart-legend');
    await expect(legend).toBeVisible();
  });

  test('현금 잔액 변동 내역', async ({ page }) => {
    await page.goto('/portfolio');
    
    // 현금 내역 탭 클릭
    await page.click('text=현금 내역');
    
    // 현금 변동 테이블 확인
    const cashHistoryTable = page.locator('[data-testid="cash-history-table"]');
    await expect(cashHistoryTable).toBeVisible();
    
    // 잔액 변화 확인
    const rows = cashHistoryTable.locator('tbody tr');
    if (await rows.count() > 0) {
      await expect(rows.first().locator('.transaction-type')).toBeVisible();
      await expect(rows.first().locator('.amount')).toBeVisible();
      await expect(rows.first().locator('.balance')).toBeVisible();
    }
  });
});