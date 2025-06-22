import { test, expect } from '@playwright/test';

test.describe('인증 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('로그인 페이지 접근', async ({ page }) => {
    await page.click('text=로그인');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h2')).toContainText('로그인');
  });

  test('학생 로그인', async ({ page }) => {
    await page.goto('/login');
    
    // 로그인 폼 작성
    await page.fill('input[type="email"]', 'student@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 대시보드로 리다이렉트 확인
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('대시보드');
  });

  test('잘못된 비밀번호로 로그인 시도', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'student@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // 에러 메시지 확인
    await expect(page.locator('.toast-error')).toContainText('이메일 또는 비밀번호가 올바르지 않습니다');
  });

  test('교사 로그인', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'teacher@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 교사 대시보드로 리다이렉트
    await expect(page).toHaveURL('/teacher/dashboard');
  });

  test('로그아웃', async ({ page }) => {
    // 먼저 로그인
    await page.goto('/login');
    await page.fill('input[type="email"]', 'student@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 로그아웃
    await page.click('text=로그아웃');
    
    // 홈페이지로 리다이렉트
    await expect(page).toHaveURL('/');
  });
});