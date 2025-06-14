import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';
import * as iconv from 'iconv-lite';

const prisma = new PrismaClient();

interface StockPriceData {
  symbol: string;
  name: string;
  market: string;
  currentPrice: number;
  previousClose: number;
}

interface StockBasicData {
  standardCode: string;
  symbol: string;
  nameKr: string;
  shortName: string;
  nameEn: string;
  market: string;
}

// Helper function to read CSV with encoding
function readCSVWithEncoding(filePath: string, encoding: string = 'utf-8'): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const stream = fs.createReadStream(filePath);
    
    // Try different encodings if UTF-8 fails
    let decoder = iconv.decodeStream(encoding);
    
    stream
      .pipe(decoder)
      .pipe(csvParser({
        headers: false,
        skipLines: 1, // Skip header line
      }))
      .on('data', (data: any) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error: Error) => {
        if (encoding === 'utf-8') {
          // Retry with EUC-KR encoding (common for Korean files)
          console.log('UTF-8 failed, trying EUC-KR encoding...');
          readCSVWithEncoding(filePath, 'euc-kr')
            .then(resolve)
            .catch(reject);
        } else {
          reject(error);
        }
      });
  });
}

// Parse price data CSV (data_3241_20250615.csv)
async function parsePriceData(filePath: string): Promise<StockPriceData[]> {
  console.log('Reading price data from:', filePath);
  
  try {
    const rows = await readCSVWithEncoding(filePath, 'euc-kr');
    
    return rows.map((row) => {
      // Columns: 0=symbol, 1=name, 2=market, 3=sector, 4=currentPrice, 5=change, 6=changePercent, 7=previousClose
      const currentPrice = parseFloat(row['4']?.replace(/,/g, '').replace(/"/g, '') || '0') || 0;
      const previousClose = parseFloat(row['7']?.replace(/,/g, '').replace(/"/g, '') || '0') || 0;
      
      return {
        symbol: row['0']?.replace(/"/g, '').trim() || '',
        name: row['1']?.replace(/"/g, '').trim() || '',
        market: row['2']?.replace(/"/g, '').trim() || '',
        currentPrice: currentPrice,
        previousClose: previousClose || currentPrice, // Use current price if previous close is 0
      };
    }).filter(stock => stock.symbol && stock.name && stock.currentPrice > 0); // Filter out empty rows and zero prices
  } catch (error) {
    console.error('Error parsing price data:', error);
    return [];
  }
}

// Parse basic info CSV (data_3308_20250615.csv)
async function parseBasicData(filePath: string): Promise<StockBasicData[]> {
  console.log('Reading basic data from:', filePath);
  
  try {
    const rows = await readCSVWithEncoding(filePath, 'euc-kr');
    
    return rows.map((row) => {
      // Columns: 0=standardCode, 1=symbol, 2=nameKr, 3=shortName, 4=nameEn, 6=market
      return {
        standardCode: row['0']?.trim() || '',
        symbol: row['1']?.trim() || '',
        nameKr: row['2']?.trim() || '',
        shortName: row['3']?.trim() || '',
        nameEn: row['4']?.trim() || '',
        market: row['6']?.trim() || '',
      };
    }).filter(stock => stock.symbol && stock.nameKr); // Filter out empty rows
  } catch (error) {
    console.error('Error parsing basic data:', error);
    return [];
  }
}

// Merge data from both CSV files
function mergeStockData(priceData: StockPriceData[], basicData: StockBasicData[]) {
  const basicDataMap = new Map(
    basicData.map(item => [item.symbol, item])
  );
  
  return priceData.map(priceItem => {
    const basicItem = basicDataMap.get(priceItem.symbol);
    
    return {
      symbol: priceItem.symbol,
      name: priceItem.name,
      nameEn: basicItem?.nameEn || null,
      shortName: basicItem?.shortName || null,
      market: priceItem.market === '유가증권' ? 'KOSPI' : 
              priceItem.market === '코스닥' ? 'KOSDAQ' : 
              priceItem.market,
      currentPrice: priceItem.currentPrice,
      previousClose: priceItem.previousClose,
    };
  });
}

async function importStocks() {
  try {
    console.log('Starting stock import process...');
    
    // Define file paths
    const priceDataPath = path.join(__dirname, '../../data_3241_20250615.csv');
    const basicDataPath = path.join(__dirname, '../../data_3308_20250615.csv');
    
    // Check if files exist
    if (!fs.existsSync(priceDataPath)) {
      throw new Error(`Price data file not found: ${priceDataPath}`);
    }
    if (!fs.existsSync(basicDataPath)) {
      throw new Error(`Basic data file not found: ${basicDataPath}`);
    }
    
    // Parse both CSV files
    const priceData = await parsePriceData(priceDataPath);
    const basicData = await parseBasicData(basicDataPath);
    
    console.log(`Parsed ${priceData.length} stocks from price data`);
    console.log(`Parsed ${basicData.length} stocks from basic data`);
    
    // Merge data
    const mergedData = mergeStockData(priceData, basicData);
    console.log(`Merged data contains ${mergedData.length} stocks`);
    
    // Import stocks to database
    let imported = 0;
    let updated = 0;
    let errors = 0;
    
    for (const stock of mergedData) {
      try {
        // Skip if essential data is missing
        if (!stock.symbol || !stock.name) {
          console.warn('Skipping stock with missing data:', stock);
          continue;
        }
        
        // Upsert stock data
        const result = await prisma.stock.upsert({
          where: { symbol: stock.symbol },
          update: {
            name: stock.name,
            nameEn: stock.nameEn,
            shortName: stock.shortName,
            market: stock.market,
            currentPrice: stock.currentPrice,
            previousClose: stock.previousClose,
            updatedAt: new Date(),
          },
          create: {
            symbol: stock.symbol,
            name: stock.name,
            nameEn: stock.nameEn,
            shortName: stock.shortName,
            market: stock.market,
            currentPrice: stock.currentPrice,
            previousClose: stock.previousClose,
            isActive: true,
            isTracked: false, // Default to not tracked
          },
        });
        
        if (result.createdAt.getTime() === result.updatedAt.getTime()) {
          imported++;
          console.log(`Imported: ${stock.symbol} - ${stock.name}`);
        } else {
          updated++;
          console.log(`Updated: ${stock.symbol} - ${stock.name}`);
        }
        
      } catch (error) {
        errors++;
        console.error(`Error importing stock ${stock.symbol}:`, error);
      }
    }
    
    console.log('\n=== Import Summary ===');
    console.log(`Total processed: ${mergedData.length}`);
    console.log(`Imported: ${imported}`);
    console.log(`Updated: ${updated}`);
    console.log(`Errors: ${errors}`);
    
    // Set some popular stocks as tracked
    const popularStocks = [
      '005930', // 삼성전자
      '000660', // SK하이닉스
      '035720', // 카카오
      '035420', // NAVER
      '005380', // 현대차
      '051910', // LG화학
      '006400', // 삼성SDI
      '003670', // 포스코
      '105560', // KB금융
      '055550', // 신한지주
    ];
    
    console.log('\nSetting popular stocks as tracked...');
    await prisma.stock.updateMany({
      where: {
        symbol: { in: popularStocks },
      },
      data: {
        isTracked: true,
      },
    });
    
    console.log('Import completed successfully!');
    
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importStocks()
  .then(() => {
    console.log('Script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });