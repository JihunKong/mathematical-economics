const fetch = require('node-fetch');

async function testDirectAPI() {
  try {
    // 실제 API 엔드포인트 테스트
    const baseUrl = 'https://경제수학.com';
    
    console.log('Testing API endpoint directly...');
    
    // 먼저 로그인 시도 (테스트 계정)
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'student@test.com', // 실제 학생 계정 필요
        password: 'password123'
      })
    });
    
    console.log('Login response status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginResponse.ok) {
      console.log('Login failed, cannot test trading API');
      return;
    }
    
    const token = loginData.data?.accessToken;
    if (!token) {
      console.log('No access token received');
      return;
    }
    
    console.log('Got access token, testing trading API...');
    
    // 거래 API 테스트
    const tradingResponse = await fetch(`${baseUrl}/api/trading/buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        symbol: '005930', // 삼성전자
        quantity: 1,
        reason: 'API 테스트'
      })
    });
    
    console.log('=== TRADING API RESPONSE ===');
    console.log('Status:', tradingResponse.status);
    console.log('Status Text:', tradingResponse.statusText);
    console.log('Headers:', Object.fromEntries(tradingResponse.headers.entries()));
    
    const tradingData = await tradingResponse.json();
    console.log('Response Data:', JSON.stringify(tradingData, null, 2));
    
    if (tradingData.code) {
      console.log('Error Code:', tradingData.code);
    }
    
    if (tradingData.message) {
      console.log('Error Message Length:', tradingData.message.length);
      console.log('Error Message:', tradingData.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// 실행
testDirectAPI();