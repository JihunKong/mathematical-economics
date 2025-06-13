import axios from 'axios';
import { logger } from '../utils/logger';

interface KISStockData {
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
  marketCap?: number;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class KISService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private cache = new Map<string, { data: KISStockData; timestamp: number }>();
  private readonly CACHE_TTL = 5000; // 5 seconds

  constructor() {
    this.apiKey = process.env.KIS_APP_KEY || '';
    this.apiSecret = process.env.KIS_APP_SECRET || '';
    // 모의투자 URL 사용
    this.baseUrl = process.env.KIS_IS_PAPER === 'true' 
      ? 'https://openapivts.koreainvestment.com:29443'
      : 'https://openapi.koreainvestment.com:9443';
    
    if (!this.apiKey || !this.apiSecret) {
      logger.warn('KIS API credentials not configured');
    }
    
    logger.info(`KIS Service initialized with ${process.env.KIS_IS_PAPER === 'true' ? 'paper' : 'real'} trading URL`);
  }

  // 접근 토큰 발급
  private async getAccessToken(): Promise<string | null> {
    try {
      // 토큰이 있고 만료되지 않았으면 재사용
      if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.accessToken;
      }

      logger.info('Requesting new KIS access token');

      const response = await axios.post(
        `${this.baseUrl}/oauth2/tokenP`,
        {
          grant_type: 'client_credentials',
          appkey: this.apiKey,
          appsecret: this.apiSecret,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const data: TokenResponse = response.data;
      
      if (data.access_token) {
        this.accessToken = data.access_token;
        // 토큰 만료 시간 설정 (보통 24시간)
        this.tokenExpiry = new Date();
        this.tokenExpiry.setSeconds(this.tokenExpiry.getSeconds() + data.expires_in - 300); // 5분 전에 갱신
        
        logger.info('KIS access token obtained successfully');
        return this.accessToken;
      }

      logger.error('No access token in response');
      return null;
    } catch (error: any) {
      logger.error('Failed to get KIS access token:', {
        message: error.message,
        response: error.response?.data,
      });
      return null;
    }
  }

  // 주식 현재가 조회 (국내주식시세/주식현재가시세)
  async getStockPrice(symbol: string): Promise<KISStockData | null> {
    try {
      // 캐시 확인
      const cached = this.cache.get(symbol);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        logger.info(`Returning cached KIS data for ${symbol}`);
        return cached.data;
      }

      const token = await this.getAccessToken();
      if (!token) {
        logger.error('Failed to get access token');
        return null;
      }

      logger.info(`Fetching KIS data for ${symbol}`);

      const response = await axios.get(
        `${this.baseUrl}/uapi/domestic-stock/v1/quotations/inquire-price`,
        {
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'authorization': `Bearer ${token}`,
            'appkey': this.apiKey,
            'appsecret': this.apiSecret,
            'tr_id': 'FHKST01010100', // 주식현재가 시세
            'custtype': 'P', // 개인
          },
          params: {
            FID_COND_MRKT_DIV_CODE: 'J', // 주식
            FID_INPUT_ISCD: symbol,
          },
          timeout: 10000,
        }
      );

      const data = response.data;
      
      if (data.rt_cd !== '0') {
        logger.error(`KIS API error for ${symbol}:`, data.msg1);
        return null;
      }

      const output = data.output;
      
      const stockData: KISStockData = {
        symbol: symbol,
        name: output.hts_kor_isnm || '', // 종목명
        currentPrice: parseInt(output.stck_prpr) || 0, // 현재가
        previousClose: parseInt(output.stck_sdpr) || 0, // 전일종가
        change: parseInt(output.prdy_vrss) || 0, // 전일대비
        changePercent: parseFloat(output.prdy_ctrt) || 0, // 전일대비율
        dayOpen: parseInt(output.stck_oprc) || 0, // 시가
        dayHigh: parseInt(output.stck_hgpr) || 0, // 고가
        dayLow: parseInt(output.stck_lwpr) || 0, // 저가
        volume: parseInt(output.acml_vol) || 0, // 누적거래량
        marketCap: output.hts_avls ? parseInt(output.hts_avls) * 100000000 : undefined, // 시가총액(억원)
      };

      // 캐시에 저장
      this.cache.set(symbol, { data: stockData, timestamp: Date.now() });

      logger.info(`Successfully fetched stock price from KIS for ${symbol}: ${stockData.currentPrice}`);
      return stockData;
    } catch (error: any) {
      logger.error(`Failed to fetch stock price from KIS for ${symbol}:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return null;
    }
  }

  // 여러 종목 가격 조회
  async getMultipleStockPrices(symbols: string[]): Promise<KISStockData[]> {
    const results: KISStockData[] = [];
    
    // 병렬 처리 (최대 5개씩)
    const batchSize = 5;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const promises = batch.map(symbol => this.getStockPrice(symbol));
      const batchResults = await Promise.all(promises);
      
      results.push(...batchResults.filter((r): r is KISStockData => r !== null));
      
      // Rate limiting
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return results;
  }

  // 주식 호가 조회
  async getOrderbook(symbol: string) {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return null;
      }

      const response = await axios.get(
        `${this.baseUrl}/uapi/domestic-stock/v1/quotations/inquire-asking-price-exp-ccn`,
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'authorization': `Bearer ${token}`,
            'appkey': this.apiKey,
            'appsecret': this.apiSecret,
            'tr_id': 'FHKST01010200', // 주식호가
          },
          params: {
            fid_cond_mrkt_div_code: 'J',
            fid_input_iscd: symbol,
          },
          timeout: 10000,
        }
      );

      const data = response.data;
      
      if (data.rt_cd !== '0') {
        logger.error(`KIS API error for orderbook ${symbol}:`, data.msg1);
        return null;
      }

      return data.output1;
    } catch (error: any) {
      logger.error(`Failed to fetch orderbook from KIS for ${symbol}:`, error.message);
      return null;
    }
  }

  // 캐시 초기화
  clearCache() {
    this.cache.clear();
  }
}