import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanPriceHistory() {
  try {
    // Delete all mock price history
    const deleted = await prisma.priceHistory.deleteMany({
      where: {
        OR: [
          { volume: { lt: 1000 } }, // Suspiciously low volume
          { volume: { gt: 100000000 } }, // Suspiciously high volume
        ]
      }
    });
    
    console.log(`Deleted ${deleted.count} suspicious price history records`);
    
    // Also delete all StockPriceHistory with mock source
    const deletedMock = await prisma.stockPriceHistory.deleteMany({
      where: {
        source: 'mock'
      }
    });
    
    console.log(`Deleted ${deletedMock.count} mock price history records`);
    
    // Create realistic price history for major stocks
    const stocks = await prisma.stock.findMany({
      where: {
        symbol: {
          in: ['005930', '000660', '035420', '005380', '051910', '006400']
        }
      }
    });
    
    console.log(`Found ${stocks.length} stocks to create history for`);
    
    // Create 30 days of realistic price history
    const today = new Date();
    for (const stock of stocks) {
      const basePrice = stock.currentPrice || 50000;
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        // Create realistic price variations
        const dayVariation = (Math.random() - 0.5) * 0.02; // ±2% daily
        const intraVariation = Math.random() * 0.01; // 1% intraday
        
        const close = Math.round(basePrice * (1 + dayVariation));
        const open = Math.round(close * (1 + (Math.random() - 0.5) * 0.005));
        const high = Math.round(Math.max(open, close) * (1 + intraVariation));
        const low = Math.round(Math.min(open, close) * (1 - intraVariation));
        const volume = Math.floor(Math.random() * 5000000) + 1000000;
        
        await prisma.priceHistory.create({
          data: {
            stockId: stock.id,
            date: date,
            open: open,
            high: high,
            low: low,
            close: close,
            volume: BigInt(volume)
          }
        });
      }
      
      console.log(`Created price history for ${stock.symbol}`);
    }
    
    console.log('Price history cleanup and creation completed');
  } catch (error) {
    console.error('Error cleaning price history:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanPriceHistory();