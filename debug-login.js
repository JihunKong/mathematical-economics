const { chromium } = require('playwright');

async function debugLogin() {
  console.log('🔍 Starting login debugging...');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true // Open devtools automatically
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture all requests and responses
  page.on('request', request => {
    console.log('📤 Request:', request.method(), request.url());
    if (request.postData()) {
      console.log('📤 Post data:', request.postData());
    }
  });

  page.on('response', response => {
    console.log('📥 Response:', response.status(), response.url());
    if (response.url().includes('api')) {
      response.text().then(text => {
        console.log('📥 Response body:', text.substring(0, 200));
      });
    }
  });

  try {
    console.log('📱 Opening frontend...');
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    
    console.log('🔐 Navigating to login...');
    await page.click('text=로그인');
    await page.waitForSelector('form');
    
    console.log('📝 Filling form...');
    await page.fill('input[type="email"]', 'purusil55@gmail.com');
    await page.fill('input[type="password"]', 'admin123');
    
    console.log('🚀 Submitting form and waiting for network...');
    await page.click('button[type="submit"]');
    
    // Wait for the login request to complete
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log('📍 Final URL:', currentUrl);
    
    // Keep browser open for manual inspection
    console.log('🔍 Browser will stay open for manual inspection...');
    console.log('Check the Network tab in Developer Tools');
    
    // Wait indefinitely until manually closed
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugLogin();