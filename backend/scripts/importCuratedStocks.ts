import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import {
  getCurrencyFromMarket,
  getRegionFromMarket,
  ensurePriceInKRW,
} from '../src/config/exchangeRates';

const prisma = new PrismaClient();

interface CuratedStockRow {
  symbol: string;
  name: string;
  nameEn: string;
  shortName: string;
  market: string;
  sector: string;
  region: string;
  educationalPriority: string;
  currentPrice: string;
}

async function importCuratedStocks() {
  console.log('🚀 Starting curated stocks import...');
  console.log('📊 This will import 60 carefully selected educational stocks\n');

  const csvFilePath = path.join(__dirname, '../data/curated_stocks_60.csv');

  if (!fs.existsSync(csvFilePath)) {
    console.error('❌ CSV file not found:', csvFilePath);
    process.exit(1);
  }

  const stocks: CuratedStockRow[] = [];

  // Read CSV file
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row: CuratedStockRow) => {
        stocks.push(row);
      })
      .on('end', () => {
        console.log(`✅ Loaded ${stocks.length} stocks from CSV\n`);
        resolve();
      })
      .on('error', reject);
  });

  console.log('📝 Stock distribution by sector:');
  const sectorCounts: Record<string, number> = {};

  stocks.forEach(stock => {
    sectorCounts[stock.sector] = (sectorCounts[stock.sector] || 0) + 1;
  });

  Object.entries(sectorCounts).forEach(([sector, count]) => {
    console.log(`  ${sector}: ${count} stocks`);
  });

  console.log('\n💾 Importing stocks into database...');

  let imported = 0;
  let updated = 0;
  let errors = 0;

  for (const stock of stocks) {
    try {
      // Get original price from CSV
      const originalPrice = parseFloat(stock.currentPrice) || 0;

      // Determine currency and region from market
      const currency = getCurrencyFromMarket(stock.market);
      const region = getRegionFromMarket(stock.market);

      // Convert price to KRW if needed
      const priceInKRW = ensurePriceInKRW(originalPrice, currency);

      const existing = await prisma.stock.findUnique({
        where: { symbol: stock.symbol }
      });

      const stockData = {
        name: stock.name,
        nameEn: stock.nameEn || stock.name,
        shortName: stock.shortName || stock.name,
        market: stock.market,
        sector: stock.sector,
        currency: currency,
        region: region,
        currentPrice: priceInKRW,
        previousClose: priceInKRW,
        isActive: true,
        isTracked: false, // Will be set to true when added to watchlist
        lastPriceUpdate: new Date()
      };

      await prisma.stock.upsert({
        where: { symbol: stock.symbol },
        create: {
          symbol: stock.symbol,
          ...stockData
        },
        update: stockData
      });

      if (existing) {
        updated++;
        const conversionInfo = currency !== 'KRW'
          ? ` [${currency} ${originalPrice.toFixed(2)} → ₩${priceInKRW.toLocaleString()}]`
          : '';
        console.log(`  ↻ Updated: ${stock.symbol} - ${stock.nameEn} (${stock.sector})${conversionInfo}`);
      } else {
        imported++;
        const conversionInfo = currency !== 'KRW'
          ? ` [${currency} ${originalPrice.toFixed(2)} → ₩${priceInKRW.toLocaleString()}]`
          : '';
        console.log(`  ✓ Imported: ${stock.symbol} - ${stock.nameEn} (${stock.sector})${conversionInfo}`);
      }

    } catch (error) {
      errors++;
      console.error(`  ✗ Error importing ${stock.symbol}:`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Import Summary:');
  console.log(`  ✅ New stocks imported: ${imported}`);
  console.log(`  ↻ Existing stocks updated: ${updated}`);
  console.log(`  ❌ Errors: ${errors}`);
  console.log(`  📈 Total stocks in database: ${imported + updated}`);
  console.log('='.repeat(60));

  // Clean up old stocks that are not in the curated list
  console.log('\n🧹 Cleaning up non-curated stocks...');

  const curatedSymbols = stocks.map(s => s.symbol);
  const deletedCount = await prisma.stock.deleteMany({
    where: {
      symbol: {
        notIn: curatedSymbols
      }
    }
  });

  console.log(`  ✅ Removed ${deletedCount.count} non-curated stocks from database`);

  // Statistics
  const finalCount = await prisma.stock.count();

  console.log('\n📊 Final Database Statistics:');
  console.log(`  Total stocks: ${finalCount}`);
  console.log(`  Sectors: ${Object.keys(sectorCounts).length}`);

  console.log('\n✨ Curated stocks import completed successfully!');
  console.log('💡 Tip: Students can now select from 60 carefully chosen educational stocks\n');
}

importCuratedStocks()
  .catch((error) => {
    console.error('❌ Fatal error during import:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
