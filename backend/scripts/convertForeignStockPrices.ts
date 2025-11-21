/**
 * Convert Foreign Stock Prices to KRW
 *
 * This script converts existing foreign stock prices from their original currencies
 * (USD, EUR, etc.) to Korean Won using fixed exchange rates.
 *
 * Run this once after adding currency/region fields to the database schema.
 */

import { PrismaClient } from '@prisma/client';
import {
  EXCHANGE_RATES,
  convertToKRW,
  getCurrencyFromMarket,
  getRegionFromMarket,
} from '../src/config/exchangeRates';

const prisma = new PrismaClient();

interface ConversionResult {
  symbol: string;
  name: string;
  market: string;
  currency: string;
  region: string;
  originalPrice: number;
  convertedPrice: number;
  exchangeRate: number;
}

async function convertForeignStockPrices() {
  console.log('🔄 Starting foreign stock price conversion...\n');

  try {
    // Get all foreign stocks (non-Korean markets)
    const foreignStocks = await prisma.stock.findMany({
      where: {
        OR: [
          { market: { in: ['NASDAQ', 'NYSE', 'OTC'] } },
          { market: { notIn: ['KOSPI', 'KOSDAQ'] } },
        ],
      },
      orderBy: {
        market: 'asc',
      },
    });

    console.log(`📊 Found ${foreignStocks.length} foreign stocks to convert\n`);

    if (foreignStocks.length === 0) {
      console.log('✅ No foreign stocks found. Nothing to convert.');
      return;
    }

    const results: ConversionResult[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Process each stock
    for (const stock of foreignStocks) {
      try {
        // Determine currency and region from market
        const currency = getCurrencyFromMarket(stock.market);
        const region = getRegionFromMarket(stock.market);

        // Skip if already in KRW
        if (currency === 'KRW') {
          console.log(`⏭️  ${stock.symbol} (${stock.name}) - Already in KRW, skipping`);
          continue;
        }

        const exchangeRate = EXCHANGE_RATES[currency];

        if (!exchangeRate) {
          console.error(`❌ ${stock.symbol} - Unknown currency: ${currency}`);
          errorCount++;
          continue;
        }

        // Store original price for logging
        const originalPrice = stock.currentPrice;

        // Convert all price fields to KRW
        const updateData: any = {
          currency,
          region,
        };

        // Convert currentPrice
        if (stock.currentPrice && stock.currentPrice > 0) {
          updateData.currentPrice = convertToKRW(stock.currentPrice, currency);
        }

        // Convert previousClose
        if (stock.previousClose && stock.previousClose > 0) {
          updateData.previousClose = convertToKRW(stock.previousClose, currency);
        }

        // Convert dayOpen
        if (stock.dayOpen && stock.dayOpen > 0) {
          updateData.dayOpen = convertToKRW(stock.dayOpen, currency);
        }

        // Convert dayHigh
        if (stock.dayHigh && stock.dayHigh > 0) {
          updateData.dayHigh = convertToKRW(stock.dayHigh, currency);
        }

        // Convert dayLow
        if (stock.dayLow && stock.dayLow > 0) {
          updateData.dayLow = convertToKRW(stock.dayLow, currency);
        }

        // Update the stock in database
        await prisma.stock.update({
          where: { id: stock.id },
          data: updateData,
        });

        // Log result
        const result: ConversionResult = {
          symbol: stock.symbol,
          name: stock.name,
          market: stock.market,
          currency,
          region,
          originalPrice,
          convertedPrice: updateData.currentPrice || 0,
          exchangeRate,
        };

        results.push(result);
        successCount++;

        console.log(
          `✅ ${stock.symbol.padEnd(10)} | ${stock.name.padEnd(20)} | ` +
          `${currency} ${originalPrice.toFixed(2).padStart(10)} → ` +
          `₩${updateData.currentPrice?.toLocaleString() || '0'} ` +
          `(rate: ${exchangeRate})`
        );

      } catch (error) {
        console.error(`❌ Error converting ${stock.symbol}:`, error);
        errorCount++;
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('📈 CONVERSION SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total stocks processed: ${foreignStocks.length}`);
    console.log(`✅ Successfully converted: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('='.repeat(80));

    // Print by market
    console.log('\n📊 Conversion by Market:');
    const byMarket = results.reduce((acc, r) => {
      if (!acc[r.market]) acc[r.market] = [];
      acc[r.market].push(r);
      return acc;
    }, {} as Record<string, ConversionResult[]>);

    Object.keys(byMarket).forEach(market => {
      console.log(`\n${market}: ${byMarket[market].length} stocks`);
    });

    // Print by currency
    console.log('\n💱 Exchange Rates Applied:');
    const currencies = [...new Set(results.map(r => r.currency))];
    currencies.forEach(currency => {
      const count = results.filter(r => r.currency === currency).length;
      console.log(`  ${currency}: ${count} stocks (rate: ${EXCHANGE_RATES[currency]})`);
    });

    console.log('\n✅ Conversion completed successfully!');

  } catch (error) {
    console.error('❌ Fatal error during conversion:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
convertForeignStockPrices()
  .then(() => {
    console.log('\n🎉 Script finished successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
