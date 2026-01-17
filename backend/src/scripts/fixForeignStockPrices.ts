/**
 * 해외 주식 가격 수정 스크립트
 *
 * 이 스크립트는 잘못 저장된 해외 주식 가격을 Yahoo Finance에서
 * 실시간 데이터를 가져와 올바른 KRW 가격으로 업데이트합니다.
 */

import { PrismaClient } from '@prisma/client';
import { YahooFinanceService } from '../services/yahooFinanceService';
import { EXCHANGE_RATES, getCurrencyFromMarket, ensurePriceInKRW } from '../config/exchangeRates';

const prisma = new PrismaClient();
const yahooService = new YahooFinanceService();

async function fixForeignStockPrices() {
  console.log('=== 해외 주식 가격 수정 스크립트 ===\n');
  console.log('현재 환율 설정:', EXCHANGE_RATES, '\n');

  // 1. 해외 주식 조회
  const foreignStocks = await prisma.stock.findMany({
    where: {
      market: { in: ['NASDAQ', 'NYSE', 'OTC'] }
    },
    select: {
      id: true,
      symbol: true,
      name: true,
      market: true,
      currency: true,
      currentPrice: true,
      previousClose: true,
    }
  });

  console.log(`발견된 해외 주식: ${foreignStocks.length}개\n`);

  let updated = 0;
  let failed = 0;

  for (const stock of foreignStocks) {
    try {
      const currency = stock.currency || getCurrencyFromMarket(stock.market);
      console.log(`\n처리 중: ${stock.symbol} (${stock.name}) - 통화: ${currency}`);
      console.log(`  현재 DB 가격: ${stock.currentPrice.toLocaleString()} KRW`);

      // Yahoo Finance에서 실시간 가격 조회
      const yahooData = await yahooService.getStockPrice(stock.symbol);

      if (!yahooData || yahooData.currentPrice <= 0) {
        console.log(`  ⚠️  Yahoo Finance에서 가격을 가져올 수 없음, 건너뜀`);
        failed++;
        continue;
      }

      console.log(`  Yahoo 원본 가격: ${yahooData.currentPrice.toFixed(2)} ${currency}`);

      // KRW로 변환
      const convertedPrice = ensurePriceInKRW(yahooData.currentPrice, currency);
      const convertedPreviousClose = ensurePriceInKRW(yahooData.previousClose, currency);
      const convertedChange = ensurePriceInKRW(yahooData.change, currency);
      const convertedDayOpen = ensurePriceInKRW(yahooData.dayOpen, currency);
      const convertedDayHigh = ensurePriceInKRW(yahooData.dayHigh, currency);
      const convertedDayLow = ensurePriceInKRW(yahooData.dayLow, currency);

      console.log(`  변환된 가격: ${convertedPrice.toLocaleString()} KRW (환율: ${EXCHANGE_RATES[currency]})`);

      // DB 업데이트
      await prisma.stock.update({
        where: { id: stock.id },
        data: {
          currentPrice: convertedPrice,
          previousClose: convertedPreviousClose,
          change: convertedChange,
          changePercent: yahooData.changePercent,
          dayOpen: convertedDayOpen,
          dayHigh: convertedDayHigh,
          dayLow: convertedDayLow,
          volume: BigInt(yahooData.volume || 0),
          lastPriceUpdate: new Date(),
        }
      });

      console.log(`  ✅ 업데이트 완료`);
      updated++;

      // API 제한 방지를 위한 딜레이
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error: any) {
      console.log(`  ❌ 오류: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n=== 결과 ===`);
  console.log(`총 ${foreignStocks.length}개 중:`);
  console.log(`  - 업데이트 성공: ${updated}개`);
  console.log(`  - 실패: ${failed}개`);

  await prisma.$disconnect();
}

// 스크립트 실행
fixForeignStockPrices()
  .then(() => {
    console.log('\n스크립트 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n스크립트 오류:', error);
    process.exit(1);
  });
