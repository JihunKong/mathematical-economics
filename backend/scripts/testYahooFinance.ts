import yahooFinance from 'yahoo-finance2';

async function testYahooFinance() {
  try {
    console.log('Testing Yahoo Finance for Samsung Electronics (005930.KS)...');
    
    const quote = await yahooFinance.quote('005930.KS');
    
    console.log('Quote result:', {
      symbol: (quote as any).symbol,
      name: (quote as any).longName || (quote as any).shortName,
      regularMarketPrice: (quote as any).regularMarketPrice,
      previousClose: (quote as any).previousClose,
      regularMarketChange: (quote as any).regularMarketChange,
      regularMarketChangePercent: (quote as any).regularMarketChangePercent,
      regularMarketTime: (quote as any).regularMarketTime,
    });
    
  } catch (error: any) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
}

testYahooFinance();