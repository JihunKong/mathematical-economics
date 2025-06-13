import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import { AlphaVantageService } from '../src/services/alphaVantageService';

async function testAlphaVantage() {
  console.log('API Key loaded:', process.env.Alpha_Vantage_API_KEY ? 'Yes' : 'No');
  const service = new AlphaVantageService();
  
  console.log('Testing Alpha Vantage Service...\n');
  
  try {
    // Test Samsung Electronics
    console.log('1. Testing Samsung Electronics (005930):');
    const samsung = await service.getStockPrice('005930');
    console.log(samsung);
    
    if (samsung) {
      console.log(`\n실제 가격: ${samsung.currentPrice.toLocaleString()}원`);
      console.log(`전일 대비: ${samsung.change.toLocaleString()}원 (${samsung.changePercent.toFixed(2)}%)`);
    }
    
    // Test KB Financial
    console.log('\n2. Testing KB Financial (105560):');
    const kb = await service.getStockPrice('105560');
    console.log(kb);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAlphaVantage();