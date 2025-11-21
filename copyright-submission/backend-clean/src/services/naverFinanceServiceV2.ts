import axios from 'axios';
const cheerio = require('cheerio');
import { logger } from '../utils/logger'에러가 발생했습니다'User-Agent': '에러가 발생했습니다',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000,
        responseType: 'text'에러가 발생했습니다'.wrap_company h2 a').text().trim();
      const currentPriceText = $('#_nowVal').text().replace(/,/g, ''에러가 발생했습니다'#_diff .blind').text();
      const change = parseInt(changeText.replace(/[^0-9-]/g, ''에러가 발생했습니다'#_rate .blind').text();
      const changePercent = parseFloat(changePercentText.replace(/[^0-9.-]/g, ''));

      // 추가 정보
      const dayHighText = $('.no_info tr:nth-child(1) td:nth-child(1) .blind').text();
      const dayLowText = $('.no_info tr:nth-child(2) td:nth-child(1) .blind').text();
      const volumeText = $('.no_info tr:nth-child(3) td:nth-child(1) .blind').text();
      const dayOpenText = $('.no_info tr:nth-child(4) td:nth-child(1) .blind'에러가 발생했습니다'')) || currentPrice,
        dayHigh: parseInt(dayHighText.replace(/,/g, '')) || currentPrice,
        dayLow: parseInt(dayLowText.replace(/,/g, '')) || currentPrice,
        volume: parseInt(volumeText.replace(/,/g, ''에러가 발생했습니다'fulfilled' && result.value) {
          results.push(result.value);
        }
      }
      
      // 배치 간 딜레이
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  // 캐시 초기화
  clearCache() {
    this.cache.clear();
  }
}