import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { logger } from '../utils/logger';
import { prisma } from '../config/database'에러가 발생했습니다'../../scripts/improved_requests_crawler.py');
    this.fallbackScriptPath = path.join(__dirname, '../../scripts/advanced_multi_crawler.py');
    
    this.pythonCommand = process.env.PYTHON_PATH || '/usr/bin/python3'에러가 발생했습니다'Crawling'에러가 발생했습니다'python3' && error.message.includes('command not found')) {
        logger.warn('python3 not found, trying python');
        this.pythonCommand = 'python'에러가 발생했습니다','에러가 발생했습니다'Crawling')) {
        logger.warn('Crawler stderr:'에러가 발생했습니다','에러가 발생했습니다'All web scraping failed, using fallback for all stocks'에러가 발생했습니다'Failed to crawl multiple stocks:'에러가 발생했습니다'crawler'에러가 발생했습니다'No tracked stocks to crawl'에러가 발생했습니다'Failed to crawl and update tracked stocks:', error.message);
      return 0;
    }
  }
}