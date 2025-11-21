import { logger } from '../utils/logger'에러가 발생했습니다'005930': '삼성전자',
    '000660': 'SK하이닉스',
    '005380': '현대자동차',
    '035420': 'NAVER',
    '051910': 'LG화학',
    '006400': '삼성SDI',
    '035720': '카카오',
    '003670': '포스코',
    '105560': 'KB금융',
    '055550': '신한지주',
    '096770': '에스티팜',
    '293490': '카카오게임즈',
    '041510': '에스엠',
    '263750': '펄어비스',
    '112040': '위메이드'에러가 발생했습니다'005930': 59500,  // 삼성전자
        '000660': 139500, // SK하이닉스 
        '005380': 242000, // 현대자동차
        '035420': 181000, // NAVER
        '051910': 317000, // LG화학
        '006400': 372000, // 삼성SDI
        '035720': 40850,  // 카카오
        '003670': 405000, // 포스코
        '105560': 89900,  // KB금융
        '055550': 58400,  // 신한지주
        '096770': 66500,  // 에스티팜
        '293490': 21650,  // 카카오게임즈
        '041510': 71200,  // 에스엠
        '263750': 38850,  // 펄어비스
        '112040'에러가 발생했습니다'005930') {
        currentPrice = 59500;
        previousClose = 59900;
      } else {
        currentPrice = this.generateRealisticPrice(basePrice, true);
        previousClose = this.generateRealisticPrice(basePrice, false);
      }
      
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;
      
      const dayHigh = Math.max(currentPrice, previousClose) + Math.round(Math.random() * 500);
      const dayLow = Math.min(currentPrice, previousClose) - Math.round(Math.random() * 500);
      const dayOpen = previousClose + Math.round((Math.random() - 0.5) * 200);
      
      const volume = Math.round(Math.random() * 10000000);

      const mockData: MockStockData = {
        symbol,
        name,
        currentPrice,
        previousClose,
        change,
        changePercent,
        dayOpen,
        dayHigh,
        dayLow,
        volume,
        marketCap: currentPrice * 6000000 // Simplified market cap calculation
      };

      logger.info(`Mock stock price generated for ${symbol}: ${currentPrice} (change: ${change.toFixed(0)})`);
      return mockData;
    } catch (error: any) {
      logger.error(`Mock service error for ${symbol}:`, error.message);
      return null;
    }
  }

  async getMultipleStockPrices(symbols: string[]): Promise<MockStockData[]> {
    const results = await Promise.all(
      symbols.map(symbol => this.getStockPrice(symbol))
    );
    
    return results.filter((r): r is MockStockData => r !== null);
  }
}