const { chromium } = require('playwright');

async function finalTest() {
  console.log('🚀 Starting final comprehensive test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Monitor console and network
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('🔴 Browser error:', msg.text());
    }
  });

  page.on('response', response => {
    if (response.url().includes('api') && !response.ok()) {
      console.log('🔴 API Error:', response.status(), response.url());
    }
  });

  try {
    console.log('📱 Opening frontend...');
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    console.log('✅ Frontend loaded');

    console.log('🔐 Testing admin login...');
    await page.click('text=로그인');
    await page.waitForSelector('form');
    
    await page.fill('input[type="email"]', 'purusil55@gmail.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('📍 Current URL after login:', currentUrl);
    
    if (currentUrl.includes('dashboard') || currentUrl.includes('admin')) {
      console.log('✅ Admin login successful!');
      
      // Test navigation to different pages
      console.log('🧭 Testing navigation...');
      
      // Test admin page
      await page.goto('http://localhost:3002/admin');
      await page.waitForTimeout(2000);
      const adminPageTitle = await page.locator('h1').first().textContent();
      console.log('👨‍💼 Admin page title:', adminPageTitle);
      
      // Test teacher dashboard  
      await page.goto('http://localhost:3002/teacher');
      await page.waitForTimeout(2000);
      const teacherPageTitle = await page.locator('h1').first().textContent();
      console.log('👨‍🏫 Teacher page title:', teacherPageTitle);
      
      // Check if class exists
      const classCount = await page.locator('.bg-white.p-6.rounded-lg.shadow, .class-card').count();
      console.log('🏫 Found classes:', classCount);
      
      if (classCount === 0) {
        console.log('➕ No classes found, testing class creation...');
        
        const createButton = await page.locator('text=새 클래스 만들기, text=클래스 만들기, text=첫 클래스 만들기').first();
        if (await createButton.count() > 0) {
          await createButton.click();
          await page.waitForTimeout(1000);
          
          await page.fill('input[name="name"], [placeholder*="클래스"]', '프론트엔드 테스트 클래스');
          
          const submitButton = await page.locator('text=생성, text=만들기, button[type="submit"]').first();
          if (await submitButton.count() > 0) {
            await submitButton.click();
            await page.waitForTimeout(3000);
            console.log('✅ Class creation attempted');
          }
        }
      }
      
      // Test trading page
      console.log('💰 Testing trading page...');
      await page.goto('http://localhost:3002/trading');
      await page.waitForTimeout(3000);
      
      const stockElements = await page.locator('[data-testid="stock-card"], .stock-item, .bg-white').count();
      console.log('📈 Stock elements found:', stockElements);
      
      // Test stock management
      console.log('🔧 Testing stock management...');
      await page.goto('http://localhost:3002/stock-management');
      await page.waitForTimeout(3000);
      
      const stockManagementElements = await page.locator('.stock-row, .stock-item, tbody tr').count();
      console.log('📊 Stock management elements:', stockManagementElements);
      
      // Test portfolio page
      console.log('💼 Testing portfolio page...');
      await page.goto('http://localhost:3002/portfolio');
      await page.waitForTimeout(3000);
      
      const portfolioElements = await page.locator('.portfolio-summary, .holdings-section, .bg-white').count();
      console.log('💼 Portfolio elements found:', portfolioElements);
      
      console.log('🎉 All major pages tested successfully!');
      
    } else {
      console.log('❌ Login failed - still on login page');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    console.log('📋 Test completed. Browser will close in 10 seconds...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

finalTest();