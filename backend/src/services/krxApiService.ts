import axios from 'axios';
import { logger } from '../utils/logger';

interface KRXStockData {
  ISU_SRT_CD: string;          // 종목코드
  ISU_ABBRV: string;           // 종목명
  TDD_CLSPRC: string;          // 종가
  CMPPREVDD_PRC: string;       // 전일대비
  FLUC_RT: string;             // 등락률
  TDD_OPNPRC: string;          // 시가
  TDD_HGPRC: string;           // 고가
  TDD_LWPRC: string;           // 저가
  ACC_TRDVOL: string;          // 거래량
  ACC_TRDVAL: string;          // 거래대금
  MKTCAP: string;              // 시가총액
  LIST_SHRS: string;           // 상장주식수
}

interface KRXMarketData {
  OutBlock_1: KRXStockData[];
}

export class KRXApiService {
  private readonly baseUrl = 'http://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 60 * 1000; // 1분 (실시간 데이터)
  
  /**
   * KRX에서 실시간 주식 데이터 조회
   */
  async getStockPrice(symbol: string): Promise<any> {
    try {
      // 장시간 확인
      if (!this.isMarketOpen()) {
        logger.info('Market is closed, KRX data might not be real-time');
      }

      const cacheKey = `krx:${symbol}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        logger.info(`Returning cached KRX data for ${symbol}`);
        return cached.data;
      }

      // KOSPI 전체 종목 데이터 조회
      const kospiData = await this.getMarketData('STK');
      const stockData = this.findStockInMarket(kospiData, symbol);
      
      if (stockData) {
        const formattedData = this.formatStockData(stockData);
        this.cache.set(cacheKey, { 
          data: formattedData, 
          timestamp: Date.now() 
        });
        return formattedData;
      }

      // KOSDAQ에서 검색
      const kosdaqData = await this.getMarketData('KSQ');
      const kosdaqStock = this.findStockInMarket(kosdaqData, symbol);
      
      if (kosdaqStock) {
        const formattedData = this.formatStockData(kosdaqStock);
        this.cache.set(cacheKey, { 
          data: formattedData, 
          timestamp: Date.now() 
        });
        return formattedData;
      }

      return null;
    } catch (error: any) {
      logger.error(`Failed to fetch KRX data for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * 시장 전체 데이터 조회
   */
  private async getMarketData(marketType: 'STK' | 'KSQ'): Promise<KRXStockData[]> {
    try {
      const today = new Date();
      const trdDd = this.formatDate(today);

      const params = {
        bld: 'dbms/MDC/STAT/standard/MDCSTAT01501',
        locale: 'ko_KR',
        mktId: marketType,
        trdDd: trdDd,
        share: '1',
        money: '1',
        csvxls_isNo: 'false',
      };

      const response = await axios.get(this.baseUrl, {
        params,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'http://data.krx.co.kr/contents/MDC/MDI/mdiLoader',
        },
        timeout: 10000,
      });

      if (response.data && response.data.OutBlock_1) {
        return response.data.OutBlock_1;
      }

      return [];
    } catch (error: any) {
      logger.error(`Failed to fetch KRX market data:`, error);
      return [];
    }
  }

  /**
   * 종목 찾기
   */
  private findStockInMarket(marketData: KRXStockData[], symbol: string): KRXStockData | null {
    // 종목코드로 검색
    const stock = marketData.find(s => 
      s.ISU_SRT_CD === symbol || 
      s.ISU_SRT_CD === symbol.replace('A', '') ||
      s.ISU_ABBRV === symbol
    );
    
    return stock || null;
  }

  /**
   * KRX 데이터를 공통 형식으로 변환
   */
  private formatStockData(krxData: KRXStockData): any {
    const currentPrice = this.parseNumber(krxData.TDD_CLSPRC);
    const previousClose = currentPrice - this.parseNumber(krxData.CMPPREVDD_PRC);
    
    return {
      symbol: krxData.ISU_SRT_CD,
      name: krxData.ISU_ABBRV,
      currentPrice: currentPrice,
      previousClose: previousClose,
      change: this.parseNumber(krxData.CMPPREVDD_PRC),
      changePercent: this.parseNumber(krxData.FLUC_RT),
      dayOpen: this.parseNumber(krxData.TDD_OPNPRC),
      dayHigh: this.parseNumber(krxData.TDD_HGPRC),
      dayLow: this.parseNumber(krxData.TDD_LWPRC),
      volume: this.parseNumber(krxData.ACC_TRDVOL),
      marketCap: this.parseNumber(krxData.MKTCAP),
      timestamp: new Date(),
    };
  }

  /**
   * 문자열을 숫자로 변환
   */
  private parseNumber(value: string): number {
    if (!value) return 0;
    return parseFloat(value.replace(/,/g, ''));
  }

  /**
   * 날짜 포맷팅 (YYYYMMDD)
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * 장 운영 시간 확인
   */
  private isMarketOpen(): boolean {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const dayOfWeek = now.getDay();

    // 주말 제외
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return false;
    }

    // 장시간: 09:00 ~ 15:30
    const currentTime = hours * 60 + minutes;
    const marketOpen = 9 * 60;
    const marketClose = 15 * 60 + 30;

    return currentTime >= marketOpen && currentTime <= marketClose;
  }

  /**
   * 여러 종목 일괄 조회
   */
  async getMultipleStockPrices(symbols: string[]): Promise<any[]> {
    try {
      const kospiData = await this.getMarketData('STK');
      const kosdaqData = await this.getMarketData('KSQ');
      const allData = [...kospiData, ...kosdaqData];

      const results = [];
      for (const symbol of symbols) {
        const stock = this.findStockInMarket(allData, symbol);
        if (stock) {
          results.push(this.formatStockData(stock));
        }
      }

      return results;
    } catch (error: any) {
      logger.error('Failed to fetch multiple stock prices from KRX:', error);
      return [];
    }
  }

  /**
   * 캐시 초기화
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('KRX cache cleared');
  }
}