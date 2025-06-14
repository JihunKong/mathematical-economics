import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStockData() {
  try {
    // Count total stocks
    const totalStocks = await prisma.stock.count();
    console.log(`Total stocks in database: ${totalStocks}`);
    
    // Count by market
    const kospiCount = await prisma.stock.count({
      where: { market: 'KOSPI' }
    });
    const kosdaqCount = await prisma.stock.count({
      where: { market: 'KOSDAQ' }
    });
    
    console.log(`KOSPI stocks: ${kospiCount}`);
    console.log(`KOSDAQ stocks: ${kosdaqCount}`);
    
    // Count tracked stocks
    const trackedCount = await prisma.stock.count({
      where: { isTracked: true }
    });
    console.log(`Tracked stocks: ${trackedCount}`);
    
    // Show some sample stocks
    const sampleStocks = await prisma.stock.findMany({
      take: 10,
      orderBy: { symbol: 'asc' }
    });
    
    console.log('\nSample stocks:');
    sampleStocks.forEach(stock => {
      console.log(`${stock.symbol} - ${stock.name} (${stock.market}) - ₩${stock.currentPrice.toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('Error checking stock data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStockData();