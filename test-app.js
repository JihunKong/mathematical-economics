const { chromium } = require('playwright');

async function testApp() {
  console.log('🚀 Starting comprehensive app testing...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('📱 Testing frontend access...');
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    console.log('✅ Frontend accessible, title:', title);

    // Test login page
    console.log('🔐 Testing login functionality...');
    await page.click('text=로그인');
    await page.waitForSelector('form');
    
    // Try admin login
    await page.fill('input[type="email"]', 'purusil55@gmail.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('📍 Current URL after login:', currentUrl);
    
    if (currentUrl.includes('dashboard') || currentUrl.includes('admin')) {
      console.log('✅ Admin login successful!');
      
      // Test admin page
      console.log('🔧 Testing admin page...');
      await page.goto('http://localhost:3002/admin');
      await page.waitForSelector('text=관리자 페이지', { timeout: 5000 });
      console.log('✅ Admin page accessible');
      
      // Test teacher account creation
      console.log('👨‍🏫 Testing teacher account creation...');
      await page.click('text=교사 계정 생성');
      await page.waitForSelector('input[type="email"]');
      
      await page.fill('input[type="email"]', 'teacher@test.com');
      await page.fill('input[name="name"], input[type="text"]', '테스트 교사');
      await page.fill('input[type="password"]:not([name="password"]),[placeholder*="초기"], [placeholder*="비밀번호"]', 'teacher123!');
      
      await page.click('text=교사 계정 생성');
      await page.waitForTimeout(2000);
      console.log('✅ Teacher account creation attempted');
      
      // Test teacher dashboard access
      console.log('📚 Testing teacher dashboard...');
      await page.goto('http://localhost:3002/teacher');
      await page.waitForTimeout(2000);
      
      const teacherPageExists = await page.locator('text=교사 대시보드').count() > 0;
      if (teacherPageExists) {
        console.log('✅ Teacher dashboard accessible');
        
        // Test class creation
        const createClassButton = await page.locator('text=새 클래스 만들기, text=클래스 만들기').first();
        if (await createClassButton.count() > 0) {
          console.log('🏫 Testing class creation...');
          await createClassButton.click();
          await page.waitForTimeout(1000);
          
          // Fill class creation form
          await page.fill('input[name="name"], [placeholder*="클래스"]', '테스트 클래스');
          
          const submitButton = await page.locator('text=생성, text=만들기, button[type="submit"]').first();
          if (await submitButton.count() > 0) {
            await submitButton.click();
            await page.waitForTimeout(3000);
            console.log('✅ Class creation attempted');
          }
        }
      }
      
      // Test stock management
      console.log('📈 Testing stock management...');
      await page.goto('http://localhost:3002/stock-management');
      await page.waitForTimeout(3000);
      
      const stockElements = await page.locator('[data-testid="stock-item"], .stock-card, .stock-row').count();
      console.log(`📊 Found ${stockElements} stock elements`);
      
      // Test trading page
      console.log('💰 Testing trading page...');
      await page.goto('http://localhost:3002/trading');
      await page.waitForTimeout(3000);
      
      const tradingElements = await page.locator('[data-testid="stock-card"], .stock-item, .trading-card').count();
      console.log(`🏪 Found ${tradingElements} trading elements`);
      
    } else {
      console.log('❌ Admin login failed');
    }
    
    // Test logout and teacher login
    console.log('🚪 Testing logout and teacher login...');
    await page.click('text=로그아웃').catch(() => {
      console.log('Logout button not found, continuing...');
    });
    
    await page.goto('http://localhost:3002/login');
    await page.waitForTimeout(1000);
    
    await page.fill('input[type="email"]', 'teacher1@test.com');
    await page.fill('input[type="password"]', 'teacher123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    if (page.url().includes('teacher') || page.url().includes('dashboard')) {
      console.log('✅ Teacher login successful!');
    } else {
      console.log('❌ Teacher login failed');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('🏁 Testing completed');
  }
}

// Install playwright if needed
const { exec } = require('child_process');
exec('npx playwright install chromium', (error) => {
  if (error) {
    console.log('Playwright might already be installed, continuing...');
  }
  testApp();
});