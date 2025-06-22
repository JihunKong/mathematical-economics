import { test, expect } from '@playwright/test';

test.describe('교사 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 교사로 로그인
    await page.goto('/login');
    await page.fill('input[type="email"]', 'teacher@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/teacher/dashboard');
  });

  test('교사 대시보드 접근', async ({ page }) => {
    // 대시보드 요소 확인
    await expect(page.locator('h1')).toContainText('교사 대시보드');
    await expect(page.locator('[data-testid="student-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="class-overview"]')).toBeVisible();
  });

  test('학생 목록 조회', async ({ page }) => {
    await page.goto('/teacher/students');
    
    // 학생 테이블 확인
    const studentTable = page.locator('[data-testid="student-table"]');
    await expect(studentTable).toBeVisible();
    
    // 학생 정보 확인
    const rows = studentTable.locator('tbody tr');
    if (await rows.count() > 0) {
      const firstRow = rows.first();
      await expect(firstRow.locator('.student-name')).toBeVisible();
      await expect(firstRow.locator('.portfolio-value')).toBeVisible();
      await expect(firstRow.locator('.return-rate')).toBeVisible();
    }
  });

  test('학생 상세 정보 확인', async ({ page }) => {
    await page.goto('/teacher/students');
    
    const studentRows = page.locator('[data-testid="student-table"] tbody tr');
    if (await studentRows.count() > 0) {
      // 첫 번째 학생 클릭
      await studentRows.first().click();
      
      // 상세 정보 모달 확인
      const modal = page.locator('[data-testid="student-detail-modal"]');
      await expect(modal).toBeVisible();
      
      // 학생 정보 확인
      await expect(modal.locator('.student-name')).toBeVisible();
      await expect(modal.locator('.portfolio-summary')).toBeVisible();
      await expect(modal.locator('.transaction-history')).toBeVisible();
    }
  });

  test('클래스 설정 변경', async ({ page }) => {
    await page.goto('/teacher/settings');
    
    // 초기 자금 설정
    const initialCapitalInput = page.locator('input[name="initialCapital"]');
    await initialCapitalInput.clear();
    await initialCapitalInput.fill('50000000');
    
    // 저장 버튼 클릭
    await page.click('button:has-text("저장")');
    
    // 성공 메시지 확인
    await expect(page.locator('.toast-success')).toContainText('설정이 저장되었습니다');
  });

  test('학생 거래 내역 분석', async ({ page }) => {
    await page.goto('/teacher/analytics');
    
    // 분석 차트 확인
    await expect(page.locator('[data-testid="class-performance-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="top-performers"]')).toBeVisible();
    await expect(page.locator('[data-testid="trading-volume-chart"]')).toBeVisible();
  });

  test('클래스 리더보드 확인', async ({ page }) => {
    await page.goto('/teacher/leaderboard');
    
    // 리더보드 테이블 확인
    const leaderboard = page.locator('[data-testid="class-leaderboard"]');
    await expect(leaderboard).toBeVisible();
    
    // 순위 정보 확인
    const rankings = leaderboard.locator('.ranking-row');
    if (await rankings.count() > 0) {
      const firstRank = rankings.first();
      await expect(firstRank.locator('.rank')).toContainText('1');
      await expect(firstRank.locator('.student-name')).toBeVisible();
      await expect(firstRank.locator('.return-rate')).toBeVisible();
    }
  });

  test('거래 근거 검토', async ({ page }) => {
    await page.goto('/teacher/reviews');
    
    // 거래 근거 목록 확인
    const reviewList = page.locator('[data-testid="trading-reason-list"]');
    await expect(reviewList).toBeVisible();
    
    // 거래 근거 항목 확인
    const reasons = reviewList.locator('.reason-item');
    if (await reasons.count() > 0) {
      const firstReason = reasons.first();
      await expect(firstReason.locator('.student-name')).toBeVisible();
      await expect(firstReason.locator('.stock-name')).toBeVisible();
      await expect(firstReason.locator('.reason-text')).toBeVisible();
      await expect(firstReason.locator('.transaction-date')).toBeVisible();
    }
  });
});