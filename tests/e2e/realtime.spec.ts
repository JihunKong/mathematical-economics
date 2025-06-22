import { test, expect } from '@playwright/test';

test.describe('실시간 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 학생으로 로그인
    await page.goto('/login');
    await page.fill('input[type="email"]', 'student@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('실시간 가격 업데이트 확인', async ({ page }) => {
    await page.goto('/trading');
    
    // 주식 카드의 초기 가격 저장
    const firstStockCard = page.locator('.stock-card').first();
    const initialPrice = await firstStockCard.locator('.stock-price').textContent();
    
    // 30초 대기하며 가격 변동 확인
    let priceChanged = false;
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(5000);
      const currentPrice = await firstStockCard.locator('.stock-price').textContent();
      if (currentPrice !== initialPrice) {
        priceChanged = true;
        break;
      }
    }
    
    // 실시간 업데이트 표시 확인 (깜빡임 효과 등)
    if (priceChanged) {
      await expect(firstStockCard.locator('.price-updated')).toBeVisible();
    }
  });

  test('WebSocket 연결 상태 확인', async ({ page }) => {
    await page.goto('/trading');
    
    // 연결 상태 인디케이터 확인
    const connectionIndicator = page.locator('[data-testid="ws-connection-status"]');
    await expect(connectionIndicator).toBeVisible();
    await expect(connectionIndicator).toHaveClass(/connected/);
    
    // 네트워크 끊기 시뮬레이션
    await page.context().setOffline(true);
    await page.waitForTimeout(2000);
    
    // 연결 끊김 상태 확인
    await expect(connectionIndicator).toHaveClass(/disconnected/);
    
    // 네트워크 복구
    await page.context().setOffline(false);
    await page.waitForTimeout(5000);
    
    // 재연결 확인
    await expect(connectionIndicator).toHaveClass(/connected/);
  });

  test('실시간 차트 업데이트', async ({ page }) => {
    await page.goto('/stocks/005930'); // 삼성전자
    
    // 차트 캔버스 확인
    const chartCanvas = page.locator('canvas[data-testid="realtime-chart"]');
    await expect(chartCanvas).toBeVisible();
    
    // 초기 스크린샷
    const initialChartScreenshot = await chartCanvas.screenshot();
    
    // 30초 대기 후 차트 변화 확인
    await page.waitForTimeout(30000);
    
    const updatedChartScreenshot = await chartCanvas.screenshot();
    
    // 차트가 업데이트되었는지 확인 (픽셀 비교)
    expect(initialChartScreenshot).not.toEqual(updatedChartScreenshot);
  });

  test('실시간 거래량 업데이트', async ({ page }) => {
    await page.goto('/trading');
    
    // 거래량 표시 요소 확인
    const volumeElements = page.locator('.trading-volume');
    
    // 초기 거래량 저장
    const initialVolumes = await volumeElements.allTextContents();
    
    // 1분 대기
    await page.waitForTimeout(60000);
    
    // 거래량 변화 확인
    const updatedVolumes = await volumeElements.allTextContents();
    
    let volumeChanged = false;
    for (let i = 0; i < initialVolumes.length; i++) {
      if (initialVolumes[i] !== updatedVolumes[i]) {
        volumeChanged = true;
        break;
      }
    }
    
    expect(volumeChanged).toBeTruthy();
  });

  test('실시간 포트폴리오 가치 업데이트', async ({ page }) => {
    await page.goto('/dashboard');
    
    // 포트폴리오 총 가치 요소
    const portfolioValue = page.locator('[data-testid="total-portfolio-value"]');
    const initialValue = await portfolioValue.textContent();
    
    // 보유 종목이 있는 경우에만 테스트
    const holdings = await page.locator('[data-testid="holdings-summary"]').count();
    
    if (holdings > 0) {
      // 30초 대기 후 가치 변화 확인
      await page.waitForTimeout(30000);
      
      const updatedValue = await portfolioValue.textContent();
      
      // 가치가 변경되었거나 업데이트 애니메이션이 표시되었는지 확인
      if (updatedValue !== initialValue) {
        await expect(portfolioValue).toHaveClass(/value-updated/);
      }
    }
  });

  test('실시간 알림 수신', async ({ page }) => {
    await page.goto('/dashboard');
    
    // 알림 아이콘 확인
    const notificationBell = page.locator('[data-testid="notification-bell"]');
    await expect(notificationBell).toBeVisible();
    
    // 주요 가격 변동 시 알림 확인 (시뮬레이션)
    // 실제 환경에서는 WebSocket을 통해 알림이 전송됨
    await page.evaluate(() => {
      // 가격 급등 알림 시뮬레이션
      window.dispatchEvent(new CustomEvent('price-alert', {
        detail: { stock: '삼성전자', change: '+5%' }
      }));
    });
    
    // 알림 배지 표시 확인
    await expect(notificationBell.locator('.notification-badge')).toBeVisible();
    
    // 알림 클릭
    await notificationBell.click();
    
    // 알림 드롭다운 확인
    const notificationDropdown = page.locator('[data-testid="notification-dropdown"]');
    await expect(notificationDropdown).toBeVisible();
    await expect(notificationDropdown).toContainText('삼성전자');
    await expect(notificationDropdown).toContainText('+5%');
  });
});