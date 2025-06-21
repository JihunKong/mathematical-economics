import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import iconv from 'iconv-lite';

const prisma = new PrismaClient();

interface StockData {
  symbol: string;
  name: string;
  market: string;
  sector: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  dayOpen: number;
  dayHigh: number;
  dayLow: number;
  volume: bigint;
}

async function importStockData() {
  try {
    console.log('Starting stock data import...');
    
    // CSV 파일 경로
    const csvPath = path.join(__dirname, '../../data_3241_20250615.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error(`CSV file not found: ${csvPath}`);
      return;
    }

    // 한글 인코딩 처리 (EUC-KR)
    const buffer = fs.readFileSync(csvPath);
    const csvContent = iconv.decode(buffer, 'euc-kr');
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    
    console.log(`Found ${lines.length} lines in CSV file`);
    
    // 헤더 스킵하고 데이터 처리
    const dataLines = lines.slice(1);
    const stocks: StockData[] = [];
    
    for (const line of dataLines) {
      try {
        // CSV 파싱 (쉼표로 분리, 따옴표 제거)
        const fields = line.split(',').map(field => field.replace(/"/g, '').trim());
        
        if (fields.length < 14) {
          console.warn(`Skipping invalid line: ${line}`);
          continue;
        }
        
        const [
          symbol,
          name,
          market,
          sector = '',
          currentPriceStr,
          changeStr,
          changePercentStr,
          dayOpenStr,
          dayHighStr,
          dayLowStr,
          volumeStr
        ] = fields;
        
        // 숫자 필드 파싱
        const currentPrice = parseFloat(currentPriceStr.replace(/,/g, '')) || 0;
        const change = parseFloat(changeStr.replace(/,/g, '')) || 0;
        const changePercent = parseFloat(changePercentStr) || 0;
        const dayOpen = parseFloat(dayOpenStr.replace(/,/g, '')) || currentPrice;
        const dayHigh = parseFloat(dayHighStr.replace(/,/g, '')) || currentPrice;
        const dayLow = parseFloat(dayLowStr.replace(/,/g, '')) || currentPrice;
        const volume = BigInt(volumeStr.replace(/,/g, '') || '0');
        
        // 유효성 검사
        if (!symbol || !name || !market || currentPrice <= 0) {
          console.warn(`Skipping invalid stock data: ${symbol} ${name}`);
          continue;
        }
        
        stocks.push({
          symbol,
          name,
          market,
          sector: sector || '기타',
          currentPrice,
          change,
          changePercent,
          dayOpen,
          dayHigh,
          dayLow,
          volume
        });
        
      } catch (error) {
        console.warn(`Error parsing line: ${line}`, error);
      }
    }
    
    console.log(`Parsed ${stocks.length} valid stock records`);
    
    // 데이터베이스에 저장 (배치 처리)
    const batchSize = 100;
    let imported = 0;
    let updated = 0;
    
    for (let i = 0; i < stocks.length; i += batchSize) {
      const batch = stocks.slice(i, i + batchSize);
      
      for (const stock of batch) {
        try {
          const existing = await prisma.stock.findUnique({
            where: { symbol: stock.symbol }
          });
          
          if (existing) {
            // 기존 주식 업데이트
            await prisma.stock.update({
              where: { symbol: stock.symbol },
              data: {
                name: stock.name,
                market: stock.market,
                sector: stock.sector,
                currentPrice: stock.currentPrice,
                previousClose: existing.currentPrice, // 이전 가격을 previous close로
                dayOpen: stock.dayOpen,
                dayHigh: stock.dayHigh,
                dayLow: stock.dayLow,
                volume: stock.volume,
                change: stock.change,
                changePercent: stock.changePercent,
                lastPriceUpdate: new Date(),
                updatedAt: new Date()
              }
            });
            updated++;
          } else {
            // 새 주식 생성
            await prisma.stock.create({
              data: {
                symbol: stock.symbol,
                name: stock.name,
                market: stock.market,
                sector: stock.sector,
                currentPrice: stock.currentPrice,
                previousClose: stock.currentPrice - stock.change,
                dayOpen: stock.dayOpen,
                dayHigh: stock.dayHigh,
                dayLow: stock.dayLow,
                volume: stock.volume,
                change: stock.change,
                changePercent: stock.changePercent,
                lastPriceUpdate: new Date(),
                isActive: true
              }
            });
            imported++;
          }
        } catch (error) {
          console.error(`Error processing stock ${stock.symbol}:`, error);
        }
      }
      
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(stocks.length / batchSize)}`);
    }
    
    console.log(`\nImport completed!`);
    console.log(`- New stocks imported: ${imported}`);
    console.log(`- Existing stocks updated: ${updated}`);
    console.log(`- Total stocks in database: ${imported + updated}`);
    
  } catch (error) {
    console.error('Error importing stock data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  importStockData();
}

export { importStockData };