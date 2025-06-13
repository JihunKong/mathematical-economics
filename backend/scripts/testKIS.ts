import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import { KISService } from '../src/services/kisService';

async function testKIS() {
  console.log('Testing KIS API Service...\n');
  console.log('API Key:', process.env.KIS_APP_KEY ? 'Loaded' : 'Not found');
  console.log('API Secret:', process.env.KIS_APP_SECRET ? 'Loaded' : 'Not found');
  
  const service = new KISService();
  
  try {
    // Test Samsung Electronics
    console.log('\n1. Testing Samsung Electronics (005930):');
    const samsung = await service.getStockPrice('005930');
    console.log(samsung);
    
    if (samsung) {
      console.log(`\n실제 가격: ${samsung.currentPrice.toLocaleString()}원`);
      console.log(`전일 대비: ${samsung.change.toLocaleString()}원 (${samsung.changePercent.toFixed(2)}%)`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testKIS();