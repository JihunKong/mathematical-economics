import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';

const execAsync = promisify(exec);

interface CrawledStockData {
  symbol: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayOpen: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  timestamp: number;
  source: string;
  success: boolean;
  error?: string;
}

export class CrawlerStockService {
  private pythonScriptPath: string;
  private fallbackScriptPath: string;
  private pythonCommand: string;

  constructor() {
    // Use improved requests crawler as primary option (with retry logic)
    this.pythonScriptPath = path.join(__dirname, '../../scripts/improved_requests_crawler.py');
    this.fallbackScriptPath = path.join(__dirname, '../../scripts/advanced_multi_crawler.py');
    // Try to use python3 first, fallback to python
    this.pythonCommand = 'python3';
  }

  // 단일 종목 크롤링
  async crawlStockPrice(symbol: string): Promise<CrawledStockData | null> {
    try {
      logger.info(`Crawling stock price for ${symbol}`);
      
      // Try multi-finance crawler
      const command = `${this.pythonCommand} "${this.pythonScriptPath}" "${symbol}"`;
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr && !stderr.includes('Crawling')) {
        logger.warn(`Crawler stderr for ${symbol}:`, stderr);
      }
      
      const result = JSON.parse(stdout);
      
      if (result.success && result.currentPrice > 0) {
        logger.info(`Successfully crawled ${symbol} from ${result.source}: ${result.currentPrice}`);
        return result;
      } else if (result.error) {
        logger.warn(`Crawler failed for ${symbol}: ${result.error}`);
        // Try fallback
        const fallbackCommand = `${this.pythonCommand} "${this.fallbackScriptPath}" "${symbol}"`;
        const { stdout } = await execAsync(fallbackCommand);
        
        const fallbackResult = JSON.parse(stdout);
        
        logger.info(`Using fallback price for ${symbol}: ${fallbackResult.currentPrice}`);
        return fallbackResult;
      }
      
      return result;
    } catch (error: any) {
      // If python3 fails, try python
      if (this.pythonCommand === 'python3' && error.message.includes('command not found')) {
        logger.warn('python3 not found, trying python');
        this.pythonCommand = 'python';
        return this.crawlStockPrice(symbol);
      }
      
      logger.error(`Failed to crawl stock price for ${symbol}:`, error.message);
      return null;
    }
  }

  // 여러 종목 크롤링
  async crawlMultipleStocks(symbols: string[]): Promise<CrawledStockData[]> {
    try {
      logger.info(`Crawling ${symbols.length} stocks`);
      
      const symbolsStr = symbols.join(',');
      let results = [];
      
      // Try multi-finance crawler
      const command = `${this.pythonCommand} "${this.pythonScriptPath}" "${symbolsStr}"`;
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      
      if (stderr && !stderr.includes('Crawling')) {
        logger.warn('Crawler stderr:', stderr);
      }
      
      results = JSON.parse(stdout);
      
      // Filter out failed results
      const successResults = results.filter((r: CrawledStockData) => !r.error && r.currentPrice > 0);
      if (successResults.length > 0) {
        logger.info(`Multi-finance crawler succeeded for ${successResults.length} stocks`);
        // For failed ones, use fallback
        const failedSymbols = results
          .filter((r: CrawledStockData) => r.error || r.currentPrice === 0)
          .map((r: CrawledStockData) => r.symbol);
        
        if (failedSymbols.length > 0) {
          const fallbackCommand = `${this.pythonCommand} "${this.fallbackScriptPath}" "${failedSymbols.join(',')}"`;
          const { stdout: fallbackStdout } = await execAsync(fallbackCommand);
          const fallbackResults = JSON.parse(fallbackStdout);
          results = [...successResults, ...fallbackResults];
        } else {
          results = successResults;
        }
      } else {
        // All failed, use fallback
        logger.warn('All web scraping failed, using fallback for all stocks');
        const fallbackCommand = `${this.pythonCommand} "${this.fallbackScriptPath}" "${symbolsStr}"`;
        const { stdout } = await execAsync(fallbackCommand, {
          maxBuffer: 1024 * 1024 * 10
        });
        results = JSON.parse(stdout);
      }
      
      const validResults = results.filter((r: CrawledStockData) => !r.error);
      logger.info(`Successfully crawled ${validResults.length} out of ${symbols.length} stocks`);
      
      return validResults;
    } catch (error: any) {
      logger.error('Failed to crawl multiple stocks:', error.message);
      return [];
    }
  }

  // 크롤링한 데이터로 데이터베이스 업데이트
  async updateDatabaseWithCrawledData(data: CrawledStockData): Promise<boolean> {
    try {
      const stock = await prisma.stock.findUnique({
        where: { symbol: data.symbol }
      });
      
      if (!stock) {
        logger.error(`Stock ${data.symbol} not found in database`);
        return false;
      }
      
      // Stock 테이블 업데이트
      await prisma.stock.update({
        where: { symbol: data.symbol },
        data: {
          currentPrice: data.currentPrice,
          previousClose: data.previousClose,
          dayOpen: data.dayOpen || data.currentPrice,
          dayHigh: data.dayHigh || data.currentPrice,
          dayLow: data.dayLow || data.currentPrice,
          volume: BigInt(data.volume || 0)
        }
      });
      
      // 가격 히스토리 추가
      await prisma.stockPriceHistory.create({
        data: {
          stockId: stock.id,
          symbol: stock.symbol,
          currentPrice: data.currentPrice,
          previousClose: data.previousClose,
          dayOpen: data.dayOpen || data.currentPrice,
          dayHigh: data.dayHigh || data.currentPrice,
          dayLow: data.dayLow || data.currentPrice,
          volume: BigInt(data.volume || 0),
          change: data.change,
          changePercent: data.changePercent,
          source: 'crawler',
          timestamp: new Date(data.timestamp)
        }
      });
      
      logger.info(`Updated ${data.symbol} with crawled data: ${data.currentPrice}`);
      return true;
    } catch (error: any) {
      logger.error(`Failed to update database with crawled data for ${data.symbol}:`, error.message);
      return false;
    }
  }

  // 추적 중인 모든 종목 크롤링 및 업데이트
  async crawlAndUpdateTrackedStocks(): Promise<number> {
    try {
      // 추적 중인 종목 조회
      const trackedStocks = await prisma.stock.findMany({
        where: {
          isTracked: true,
          isActive: true
        },
        select: {
          symbol: true
        }
      });
      
      if (trackedStocks.length === 0) {
        logger.info('No tracked stocks to crawl');
        return 0;
      }
      
      const symbols = trackedStocks.map(s => s.symbol);
      logger.info(`Crawling ${symbols.length} tracked stocks`);
      
      // 크롤링 실행
      const crawledData = await this.crawlMultipleStocks(symbols);
      
      // 데이터베이스 업데이트
      let successCount = 0;
      for (const data of crawledData) {
        const success = await this.updateDatabaseWithCrawledData(data);
        if (success) successCount++;
      }
      
      logger.info(`Successfully updated ${successCount} out of ${crawledData.length} crawled stocks`);
      return successCount;
    } catch (error: any) {
      logger.error('Failed to crawl and update tracked stocks:', error.message);
      return 0;
    }
  }
}