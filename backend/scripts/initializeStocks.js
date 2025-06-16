const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Extended list of Korean stocks
const KOREAN_STOCKS = [
  // KOSPI Large Cap
  { symbol: '005930', name: '삼성전자', market: 'KOSPI', sector: '전기전자' },
  { symbol: '000660', name: 'SK하이닉스', market: 'KOSPI', sector: '전기전자' },
  { symbol: '005380', name: '현대차', market: 'KOSPI', sector: '자동차' },
  { symbol: '035420', name: 'NAVER', market: 'KOSPI', sector: '서비스업' },
  { symbol: '005490', name: 'POSCO홀딩스', market: 'KOSPI', sector: '철강금속' },
  { symbol: '051910', name: 'LG화학', market: 'KOSPI', sector: '화학' },
  { symbol: '006400', name: '삼성SDI', market: 'KOSPI', sector: '전기전자' },
  { symbol: '068270', name: '셀트리온', market: 'KOSPI', sector: '의약품' },
  { symbol: '105560', name: 'KB금융', market: 'KOSPI', sector: '금융업' },
  { symbol: '055550', name: '신한지주', market: 'KOSPI', sector: '금융업' },
  { symbol: '003670', name: '포스코퓨처엠', market: 'KOSPI', sector: '화학' },
  { symbol: '012330', name: '현대모비스', market: 'KOSPI', sector: '자동차' },
  { symbol: '207940', name: '삼성바이오로직스', market: 'KOSPI', sector: '의약품' },
  { symbol: '017670', name: 'SK텔레콤', market: 'KOSPI', sector: '통신업' },
  { symbol: '030200', name: 'KT', market: 'KOSPI', sector: '통신업' },
  { symbol: '035720', name: '카카오', market: 'KOSPI', sector: '서비스업' },
  { symbol: '003550', name: 'LG', market: 'KOSPI', sector: '기타금융' },
  { symbol: '034730', name: 'SK', market: 'KOSPI', sector: '기타금융' },
  { symbol: '015760', name: '한국전력', market: 'KOSPI', sector: '전기가스업' },
  { symbol: '032830', name: '삼성생명', market: 'KOSPI', sector: '보험' },
  { symbol: '018260', name: '삼성에스디에스', market: 'KOSPI', sector: '서비스업' },
  { symbol: '009150', name: '삼성전기', market: 'KOSPI', sector: '전기전자' },
  { symbol: '000270', name: '기아', market: 'KOSPI', sector: '자동차' },
  { symbol: '036460', name: '한국가스공사', market: 'KOSPI', sector: '전기가스업' },
  { symbol: '010130', name: '고려아연', market: 'KOSPI', sector: '철강금속' },
  
  // KOSPI Mid Cap
  { symbol: '066570', name: 'LG전자', market: 'KOSPI', sector: '전기전자' },
  { symbol: '011200', name: 'HMM', market: 'KOSPI', sector: '운수창고업' },
  { symbol: '009540', name: '현대중공업', market: 'KOSPI', sector: '기계' },
  { symbol: '000810', name: '삼성화재', market: 'KOSPI', sector: '보험' },
  { symbol: '010950', name: 'S-Oil', market: 'KOSPI', sector: '화학' },
  { symbol: '096770', name: 'SK이노베이션', market: 'KOSPI', sector: '화학' },
  { symbol: '034220', name: 'LG디스플레이', market: 'KOSPI', sector: '전기전자' },
  { symbol: '086790', name: '하나금융지주', market: 'KOSPI', sector: '금융업' },
  { symbol: '033780', name: 'KT&G', market: 'KOSPI', sector: '음식료품' },
  { symbol: '000720', name: '현대건설', market: 'KOSPI', sector: '건설업' },
  
  // KOSDAQ Large Cap
  { symbol: '035760', name: 'CJ ENM', market: 'KOSDAQ', sector: '서비스업' },
  { symbol: '036570', name: '엔씨소프트', market: 'KOSDAQ', sector: '서비스업' },
  { symbol: '251270', name: '넷마블', market: 'KOSDAQ', sector: '서비스업' },
  { symbol: '263750', name: '펄어비스', market: 'KOSDAQ', sector: '서비스업' },
  { symbol: '293490', name: '카카오게임즈', market: 'KOSDAQ', sector: '서비스업' },
  { symbol: '041510', name: '에스엠', market: 'KOSDAQ', sector: '서비스업' },
  { symbol: '352820', name: '하이브', market: 'KOSDAQ', sector: '서비스업' },
  { symbol: '112040', name: '위메이드', market: 'KOSDAQ', sector: '서비스업' },
  { symbol: '095660', name: '네오위즈', market: 'KOSDAQ', sector: '서비스업' },
  { symbol: '357780', name: '솔브레인', market: 'KOSDAQ', sector: '화학' },
  { symbol: '247540', name: '에코프로비엠', market: 'KOSDAQ', sector: '화학' },
  { symbol: '086520', name: '에코프로', market: 'KOSDAQ', sector: '화학' },
  { symbol: '328130', name: 'HLB', market: 'KOSDAQ', sector: '의약품' },
  { symbol: '091990', name: '셀트리온헬스케어', market: 'KOSDAQ', sector: '의약품' },
  { symbol: '145020', name: '휴젤', market: 'KOSDAQ', sector: '의약품' },
  
  // Popular stocks for education
  { symbol: '005935', name: '삼성전자우', market: 'KOSPI', sector: '전기전자' },
  { symbol: '373220', name: '엘지에너지솔루션', market: 'KOSPI', sector: '전기전자' },
  { symbol: '051900', name: 'LG생활건강', market: 'KOSPI', sector: '화학' },
  { symbol: '000100', name: '유한양행', market: 'KOSPI', sector: '의약품' },
  { symbol: '028260', name: '삼성물산', market: 'KOSPI', sector: '유통업' }
];

async function initializeStocks() {
  console.log('Starting stock initialization...');
  
  let addedCount = 0;
  let skippedCount = 0;
  
  for (const stock of KOREAN_STOCKS) {
    try {
      // Check if stock already exists
      const existing = await prisma.stock.findUnique({
        where: { symbol: stock.symbol }
      });
      
      if (existing) {
        console.log(`Stock ${stock.symbol} (${stock.name}) already exists, skipping...`);
        skippedCount++;
        continue;
      }
      
      // Create new stock with default values
      await prisma.stock.create({
        data: {
          symbol: stock.symbol,
          name: stock.name,
          market: stock.market,
          sector: stock.sector,
          currentPrice: 50000, // Default price
          previousClose: 50000,
          dayOpen: 50000,
          dayHigh: 50000,
          dayLow: 50000,
          volume: BigInt(1000000),
          isActive: true,
          isTracked: false // Not tracked by default
        }
      });
      
      console.log(`✅ Added ${stock.symbol} - ${stock.name}`);
      addedCount++;
      
    } catch (error) {
      console.error(`❌ Error adding stock ${stock.symbol}:`, error.message);
    }
  }
  
  console.log(`\n✅ Stock initialization completed!`);
  console.log(`Added: ${addedCount} stocks`);
  console.log(`Skipped: ${skippedCount} stocks`);
  console.log(`Total stocks in database: ${await prisma.stock.count()}`);
  
  // Set some popular stocks as tracked by default
  const popularStocks = [
    '005930', // 삼성전자
    '000660', // SK하이닉스
    '035420', // NAVER
    '035720', // 카카오
    '051910', // LG화학
    '005380', // 현대차
    '068270', // 셀트리온
    '373220', // 엘지에너지솔루션
    '207940', // 삼성바이오로직스
    '352820'  // 하이브
  ];
  
  console.log('\nSetting popular stocks as tracked...');
  for (const symbol of popularStocks) {
    await prisma.stock.update({
      where: { symbol },
      data: { isTracked: true }
    }).catch(() => {}); // Ignore if not found
  }
  
  console.log('✅ Popular stocks set as tracked');
}

initializeStocks()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });