import { test, expect } from '@playwright/test';

test.describe('리더보드 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 학생으로 로그인
    await page.goto('/login');
    await page.fill('input[type="email"]', 'student@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('전체 리더보드 확인', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // 리더보드 테이블 확인
    const leaderboardTable = page.locator('[data-testid="leaderboard-table"]');
    await expect(leaderboardTable).toBeVisible();
    
    // 헤더 확인
    await expect(leaderboardTable.locator('th')).toContainText(['순위', '이름', '수익률', '총 자산']);
    
    // 상위 10명 표시 확인
    const rows = leaderboardTable.locator('tbody tr');
    await expect(rows).toHaveCount(10, { timeout: 10000 });
  });

  test('클래스별 리더보드 필터링', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // 필터 선택
    await page.selectOption('select[name="filter"]', 'class');
    
    // 클래스별 리더보드 로드 확인
    await expect(page.locator('[data-testid="leaderboard-title"]')).toContainText('클래스 리더보드');
    
    // 테이블 데이터 확인
    const rows = page.locator('[data-testid="leaderboard-table"] tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('내 순위 하이라이트 확인', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // 내 순위 행 찾기
    const myRankRow = page.locator('tr.highlighted-row');
    
    if (await myRankRow.count() > 0) {
      await expect(myRankRow).toHaveClass(/highlighted-row/);
      await expect(myRankRow.locator('.rank')).toBeVisible();
    }
  });

  test('수익률 정렬 확인', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // 수익률 컬럼 헤더 클릭 (정렬)
    await page.click('th:has-text("수익률")');
    
    // 정렬 아이콘 확인
    await expect(page.locator('th:has-text("수익률") .sort-icon')).toBeVisible();
    
    // 데이터가 정렬되었는지 확인
    const returnRates = await page.locator('tbody tr td:nth-child(3)').allTextContents();
    const parsedRates = returnRates.map(rate => parseFloat(rate.replace('%', '')));
    
    // 내림차순 정렬 확인
    for (let i = 0; i < parsedRates.length - 1; i++) {
      expect(parsedRates[i]).toBeGreaterThanOrEqual(parsedRates[i + 1]);
    }
  });

  test('리더보드 페이지네이션', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // 페이지네이션 컨트롤 확인
    const pagination = page.locator('[data-testid="pagination"]');
    
    // 20명 이상의 사용자가 있을 때만 테스트
    if (await pagination.isVisible()) {
      // 다음 페이지 버튼 클릭
      await page.click('[data-testid="next-page"]');
      
      // URL 파라미터 확인
      await expect(page.url()).toContain('page=2');
      
      // 새로운 데이터 로드 확인
      await expect(page.locator('tbody tr').first()).toBeVisible();
    }
  });

  test('리더보드 새로고침', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // 새로고침 버튼 클릭
    await page.click('[data-testid="refresh-button"]');
    
    // 로딩 상태 확인
    await expect(page.locator('.loading-spinner')).toBeVisible();
    
    // 데이터 다시 로드 확인
    await expect(page.locator('.loading-spinner')).not.toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('리더보드 통계 요약', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // 통계 요약 카드 확인
    const statsSection = page.locator('[data-testid="leaderboard-stats"]');
    await expect(statsSection).toBeVisible();
    
    // 주요 통계 확인
    await expect(statsSection.locator('[data-testid="avg-return"]')).toBeVisible();
    await expect(statsSection.locator('[data-testid="top-return"]')).toBeVisible();
    await expect(statsSection.locator('[data-testid="total-participants"]')).toBeVisible();
  });
});