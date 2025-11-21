import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger'에러가 발생했습니다'https://finance.naver.com'에러가 발생했습니다'User-Agent': '에러가 발생했습니다',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cache-Control': 'max-age=0'에러가 발생했습니다'.no_today .blind').first().text().replace(/,/g, ''에러가 발생했습니다'.no_exday .blind').first().text().replace(/,/g, ''에러가 발생했습니다''));
        if (changeMatch[1] === '하락') {
          change = -change;
        }
      }
      
      // 종목명
      const name = $('.wrap_company h2 a'에러가 발생했습니다'.no_today em:nth-child(1) .blind').text().replace(/,/g, '');
      const dayLowText = $('.no_today em:nth-child(2) .blind').text().replace(/,/g, '');
      const volumeText = $('.no_today em:nth-child(3) .blind').text().replace(/,/g, ''에러가 발생했습니다'Failed to fetch multiple stock prices from Naver:'에러가 발생했습니다'stock',
        },
        headers: {
          'User-Agent': '에러가 발생했습니다',
          'Referer': 'https://finance.naver.com/'에러가 발생했습니다'') || '0'),
        previousClose: parseInt(item.pcv?.replace(/,/g, '') || '0'),
        change: parseInt(item.cv?.replace(/,/g, '') || '0'),
        changePercent: parseFloat(item.cr || '0'),
        dayOpen: parseInt(item.ov?.replace(/,/g, '') || '0'),
        dayHigh: parseInt(item.hv?.replace(/,/g, '') || '0'),
        dayLow: parseInt(item.lv?.replace(/,/g, '') || '0'),
        volume: parseInt(item.aq?.replace(/,/g, '') || '0'에러가 발생했습니다'KOSPI' | 'KOSDAQ' = 'KOSPI'): Promise<NaverStockData[]> {
    try {
      const marketCode = market === 'KOSPI' ? 'KOSPI' : 'KOSDAQ'에러가 발생했습니다'User-Agent': '에러가 발생했습니다',
          'Referer': 'https://finance.naver.com/'에러가 발생했습니다'')),
        previousClose: parseInt(stockData.pcv.replace(/,/g, '')),
        change: parseInt(stockData.cv.replace(/,/g, ''에러가 발생했습니다'')),
        dayHigh: parseInt(stockData.hv.replace(/,/g, '')),
        dayLow: parseInt(stockData.lv.replace(/,/g, '')),
        volume: parseInt(stockData.aq.replace(/,/g, '')),
      })).filter((stock: NaverStockData) => stock.currentPrice > 0);
    } catch (error) {
      logger.error(`Failed to fetch popular stocks from Naver for ${market}:`, error);
      return [];
    }
  }
}