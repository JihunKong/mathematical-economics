const { chromium } = require('playwright');

async function debugTest() {
  console.log('🔍 Starting detailed debugging...');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1000 // Slow down for observation
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to console logs from the page
  page.on('console', msg => {
    console.log('🌐 Browser console:', msg.type(), msg.text());
  });

  // Listen to network requests
  page.on('request', request => {
    if (request.url().includes('api')) {
      console.log('📡 API Request:', request.method(), request.url());
    }
  });

  page.on('response', response => {
    if (response.url().includes('api')) {
      console.log('📨 API Response:', response.status(), response.url());
    }
  });

  try {
    console.log('📱 Opening frontend...');
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    
    console.log('🔐 Navigating to login...');
    const loginButton = page.locator('text=로그인').first();
    await loginButton.click();
    await page.waitForSelector('form', { timeout: 10000 });
    
    console.log('📝 Filling login form...');
    await page.fill('input[type="email"]', 'purusil55@gmail.com');
    await page.fill('input[type="password"]', 'admin123');
    
    console.log('🚀 Submitting login form...');
    await page.click('button[type="submit"]');
    
    // Wait longer and check for any errors
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log('📍 Final URL:', currentUrl);
    
    // Check if there are any error messages on the page
    const errorElements = await page.locator('.error, .alert, [role="alert"]').all();
    for (const element of errorElements) {
      const text = await element.textContent();
      console.log('❌ Error on page:', text);
    }
    
    // Check console for errors
    const logs = await page.evaluate(() => {
      return console.logs || [];
    });
    
    console.log('📋 Waiting for any final network requests...');
    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    // Keep browser open for manual inspection
    console.log('🔍 Browser will stay open for manual inspection. Close manually when done.');
    // await browser.close();
  }
}

debugTest();