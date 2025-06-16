const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const iconv = require('iconv-lite');

const prisma = new PrismaClient();

// Helper function to parse CSV file with EUC-KR encoding
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = fs.createReadStream(filePath)
      .pipe(iconv.decodeStream('EUC-KR'))
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Helper function to parse numbers from Korean format
function parseNumber(str) {
  if (!str || str === '0' || str === '') return 0;
  // Remove commas and convert to number
  return parseFloat(str.replace(/,/g, '')) || 0;
}

// Helper function to clean sector names
function cleanSector(sector) {
  if (!sector || sector === '') return null;
  // Remove parentheses content
  return sector.replace(/\(.*?\)/g, '').trim();
}

async function importStocks() {
  try {
    console.log('📊 Starting stock data import from CSV files...\n');

    // Read stock price data (data_3241_20250615.csv)
    const priceDataPath = path.join(__dirname, '../../data_3241_20250615.csv');
    const priceData = await parseCSV(priceDataPath);
    console.log(`✅ Loaded ${priceData.length} records from price data file`);

    // Read stock info data (data_3308_20250615.csv)
    const infoDataPath = path.join(__dirname, '../../data_3308_20250615.csv');
    const infoData = await parseCSV(infoDataPath);
    console.log(`✅ Loaded ${infoData.length} records from info data file`);

    // Create a map of stock info by symbol
    const infoMap = new Map();
    infoData.forEach(row => {
      if (row['단축코드']) {
        infoMap.set(row['단축코드'], {
          name: row['한글 종목약명'] || row['한글 종목명'],
          fullName: row['한글 종목명'],
          englishName: row['영문 종목명'],
          listingDate: row['상장일'],
          market: row['시장구분'],
          sector: cleanSector(row['소속부']),
          faceValue: parseNumber(row['액면가']),
          shares: parseNumber(row['상장주식수'])
        });
      }
    });

    console.log(`\n📈 Processing stock data...\n`);

    let addedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    // Process price data
    for (const row of priceData) {
      try {
        const symbol = row['종목코드'];
        const name = row['종목명'];
        const market = row['시장구분'];
        const sector = cleanSector(row['소속부']);
        
        // Skip if no symbol
        if (!symbol) continue;

        // Get additional info from info map
        const info = infoMap.get(symbol) || {};

        // Parse price data
        const currentPrice = parseNumber(row['종가']);
        const previousClose = currentPrice + parseNumber(row['대비']);
        const dayOpen = parseNumber(row['시가']);
        const dayHigh = parseNumber(row['고가']);
        const dayLow = parseNumber(row['저가']);
        const volume = parseNumber(row['거래량']);
        const change = parseNumber(row['대비']);
        const changePercent = parseFloat(row['등락률']) || 0;

        // Check if stock exists
        const existingStock = await prisma.stock.findUnique({
          where: { symbol }
        });

        if (existingStock) {
          // Update existing stock with latest price data
          await prisma.stock.update({
            where: { symbol },
            data: {
              currentPrice,
              previousClose,
              dayOpen,
              dayHigh,
              dayLow,
              volume: BigInt(volume),
              change,
              changePercent,
              updatedAt: new Date()
            }
          });
          updatedCount++;
          console.log(`📊 Updated: ${symbol} - ${name} | Price: ₩${currentPrice.toLocaleString()}`);
        } else {
          // Create new stock
          await prisma.stock.create({
            data: {
              symbol,
              name: name || info.name || symbol,
              market: market || 'KOSPI',
              sector: sector || info.sector,
              currentPrice,
              previousClose,
              dayOpen,
              dayHigh,
              dayLow,
              volume: BigInt(volume),
              change,
              changePercent,
              isActive: true,
              isTracked: false
            }
          });
          addedCount++;
          console.log(`✅ Added: ${symbol} - ${name} | Market: ${market} | Price: ₩${currentPrice.toLocaleString()}`);
        }

      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing ${row['종목코드']}: ${error.message}`);
      }
    }

    // Add price history for tracked stocks
    console.log('\n📈 Adding price history for tracked stocks...');
    const trackedStocks = await prisma.stock.findMany({
      where: { isTracked: true }
    });

    for (const stock of trackedStocks) {
      try {
        await prisma.stockPriceHistory.create({
          data: {
            stockId: stock.id,
            currentPrice: stock.currentPrice,
            previousClose: stock.previousClose,
            dayOpen: stock.dayOpen,
            dayHigh: stock.dayHigh,
            dayLow: stock.dayLow,
            volume: stock.volume,
            change: stock.change,
            changePercent: stock.changePercent,
            timestamp: new Date()
          }
        });
      } catch (error) {
        console.error(`Error adding price history for ${stock.symbol}: ${error.message}`);
      }
    }

    // Summary
    console.log('\n✅ Import completed!');
    console.log(`📊 Summary:`);
    console.log(`   - New stocks added: ${addedCount}`);
    console.log(`   - Stocks updated: ${updatedCount}`);
    console.log(`   - Errors: ${errorCount}`);
    console.log(`   - Total stocks in database: ${await prisma.stock.count()}`);
    console.log(`   - Tracked stocks: ${await prisma.stock.count({ where: { isTracked: true } })}`);

    // Set top volume stocks as tracked (if not many are tracked)
    const trackedCount = await prisma.stock.count({ where: { isTracked: true } });
    if (trackedCount < 20) {
      console.log('\n🎯 Setting high-volume stocks as tracked...');
      
      // Get top 20 stocks by volume
      const topStocks = await prisma.stock.findMany({
        where: {
          isTracked: false,
          volume: { gt: BigInt(0) }
        },
        orderBy: { volume: 'desc' },
        take: 20 - trackedCount
      });

      for (const stock of topStocks) {
        await prisma.stock.update({
          where: { id: stock.id },
          data: { isTracked: true }
        });
        console.log(`   ✓ Tracked: ${stock.symbol} - ${stock.name}`);
      }
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importStocks();