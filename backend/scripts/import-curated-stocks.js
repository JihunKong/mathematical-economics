const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const csv = require('csv-parser');

const prisma = new PrismaClient();

async function importStocks() {
  console.log('🚀 Starting curated stocks import...');

  const stocks = [];

  // Read CSV file
  await new Promise((resolve, reject) => {
    fs.createReadStream('/Users/jihunkong/AWS/mathematical-economics/backend/data/curated_stocks_60.csv')
      .pipe(csv())
      .on('data', (row) => stocks.push(row))
      .on('end', () => {
        console.log(`✅ Loaded ${stocks.length} stocks from CSV\n`);
        resolve();
      })
      .on('error', reject);
  });

  console.log('💾 Importing stocks into database...');

  let imported = 0;
  let updated = 0;
  let errors = 0;

  for (const stock of stocks) {
    try {
      const currentPrice = parseFloat(stock.currentPrice) || 0;

      const existing = await prisma.stock.findUnique({
        where: { symbol: stock.symbol }
      });

      const stockData = {
        name: stock.name,
        nameEn: stock.nameEn || stock.name,
        shortName: stock.shortName || stock.name,
        market: stock.market,
        sector: stock.sector,
        currentPrice: currentPrice,
        previousClose: currentPrice,
        isActive: true,
        isTracked: false,
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
        console.log(`  ↻ Updated: ${stock.symbol} - ${stock.nameEn} (${stock.sector})`);
      } else {
        imported++;
        console.log(`  ✓ Imported: ${stock.symbol} - ${stock.nameEn} (${stock.sector})`);
      }

    } catch (error) {
      errors++;
      console.error(`  ✗ Error importing ${stock.symbol}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Import Summary:');
  console.log(`  ✅ New stocks imported: ${imported}`);
  console.log(`  ↻ Existing stocks updated: ${updated}`);
  console.log(`  ❌ Errors: ${errors}`);
  console.log(`  📈 Total stocks in database: ${await prisma.stock.count()}`);
  console.log('='.repeat(60));

  console.log('\n✨ Curated stocks import completed successfully!');
}

importStocks()
  .catch((error) => {
    console.error('❌ Fatal error during import:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
