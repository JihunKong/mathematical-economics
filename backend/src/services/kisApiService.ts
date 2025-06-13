import axios, { AxiosInstance } from 'axios';
import { kisApiConfig } from '../config/kisApi';
import { logger } from '../utils/logger';
// import crypto from 'crypto'; // Currently unused

interface KISTokenResponse {
  access_token: string;
  access_token_token_expired: string;
  token_type: string;
  expires_in: number;
}

interface KISStockPrice {
  stck_prpr: string; // 현재가
  prdy_vrss: string; // 전일대비
  prdy_vrss_sign: string; // 전일대비부호
  prdy_ctrt: string; // 전일대비율
  stck_oprc: string; // 시가
  stck_hgpr: string; // 고가
  stck_lwpr: string; // 저가
  acml_vol: string; // 누적거래량
  stck_mxpr: string; // 상한가
  stck_llam: string; // 하한가
  per: string; // PER
  pbr: string; // PBR
  eps: string; // EPS
}

interface KISStockInfo {
  hts_kor_isnm: string; // 종목명
  stck_shrn_iscd: string; // 종목코드
  mrkt_ctg: string; // 시장구분
  stck_prpr: string; // 현재가
}

export class KISApiService {
  private api: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: kisApiConfig.baseUrl,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  }

  // 접근 토큰 발급
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await this.api.post<KISTokenResponse>('/oauth2/tokenP', {
        grant_type: 'client_credentials',
        appkey: kisApiConfig.appKey,
        appsecret: kisApiConfig.appSecret
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 60) * 1000);
      
      logger.info('KIS API access token refreshed');
      return this.accessToken;
    } catch (error) {
      logger.error('Failed to get KIS API access token:', error);
      throw new Error('KIS API 인증 실패');
    }
  }

  // API 요청 헤더 생성
  private async getHeaders(trId: string, isContinuous: boolean = false): Promise<any> {
    const token = await this.getAccessToken();
    
    return {
      'authorization': `Bearer ${token}`,
      'appkey': kisApiConfig.appKey,
      'appsecret': kisApiConfig.appSecret,
      'tr_id': trId,
      'tr_cont': isContinuous ? 'Y' : 'N',
      'custtype': 'P', // 개인
      'content-type': 'application/json; charset=utf-8'
    };
  }

  // 주식 현재가 조회
  async getStockPrice(stockCode: string): Promise<KISStockPrice> {
    try {
      const headers = await this.getHeaders(kisApiConfig.isPaper ? 'VTTW8308R' : 'FHKST01010100');
      
      const response = await this.api.get('/uapi/domestic-stock/v1/quotations/inquire-price', {
        headers,
        params: {
          FID_COND_MRKT_DIV_CODE: 'J', // 주식
          FID_INPUT_ISCD: stockCode
        }
      });

      if (response.data.rt_cd !== '0') {
        throw new Error(response.data.msg1);
      }

      return response.data.output;
    } catch (error) {
      logger.error(`Failed to get stock price for ${stockCode}:`, error);
      throw error;
    }
  }

  // 주식 기본 정보 조회
  async getStockInfo(stockCode: string): Promise<KISStockInfo> {
    try {
      const headers = await this.getHeaders('CTPF1002R');
      
      const response = await this.api.get('/uapi/domestic-stock/v1/quotations/search-stock-info', {
        headers,
        params: {
          PRDT_TYPE_CD: '300', // 주식
          PDNO: stockCode
        }
      });

      if (response.data.rt_cd !== '0') {
        throw new Error(response.data.msg1);
      }

      return response.data.output;
    } catch (error) {
      logger.error(`Failed to get stock info for ${stockCode}:`, error);
      throw error;
    }
  }

  // 주식 차트 데이터 조회 (일봉)
  async getStockChart(stockCode: string, startDate: string, endDate: string, period: 'D' | 'W' | 'M' = 'D') {
    try {
      const headers = await this.getHeaders('FHKST03010100');
      
      const response = await this.api.get('/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice', {
        headers,
        params: {
          FID_COND_MRKT_DIV_CODE: 'J',
          FID_INPUT_ISCD: stockCode,
          FID_INPUT_DATE_1: startDate.replace(/-/g, ''),
          FID_INPUT_DATE_2: endDate.replace(/-/g, ''),
          FID_PERIOD_DIV_CODE: period,
          FID_ORG_ADJ_PRC: '0' // 수정주가 사용안함
        }
      });

      if (response.data.rt_cd !== '0') {
        throw new Error(response.data.msg1);
      }

      return response.data.output2; // 차트 데이터는 output2에 있음
    } catch (error) {
      logger.error(`Failed to get stock chart for ${stockCode}:`, error);
      throw error;
    }
  }

  // 업종별 종목 리스트 조회
  async getStocksByMarket(marketCode: string = '0001') { // 0001: 코스피, 1001: 코스닥
    try {
      const headers = await this.getHeaders('CTPF1604R');
      
      const response = await this.api.get('/uapi/domestic-stock/v1/quotations/inquire-member', {
        headers,
        params: {
          UPJONG_CD: marketCode
        }
      });

      if (response.data.rt_cd !== '0') {
        throw new Error(response.data.msg1);
      }

      return response.data.output;
    } catch (error) {
      logger.error(`Failed to get stocks by market ${marketCode}:`, error);
      throw error;
    }
  }

  // 주식 호가 조회
  async getStockOrderbook(stockCode: string) {
    try {
      const headers = await this.getHeaders('FHKST01010200');
      
      const response = await this.api.get('/uapi/domestic-stock/v1/quotations/inquire-asking-price-exp-ccn', {
        headers,
        params: {
          FID_COND_MRKT_DIV_CODE: 'J',
          FID_INPUT_ISCD: stockCode
        }
      });

      if (response.data.rt_cd !== '0') {
        throw new Error(response.data.msg1);
      }

      return response.data.output1;
    } catch (error) {
      logger.error(`Failed to get orderbook for ${stockCode}:`, error);
      throw error;
    }
  }

  // 실시간 체결가 조회를 위한 WebSocket URL 생성
  getWebSocketUrl(): string {
    if (kisApiConfig.isPaper) {
      return 'ws://ops.koreainvestment.com:31000';
    }
    return 'ws://ops.koreainvestment.com:21000';
  }

  // WebSocket 연결을 위한 approval key 생성
  async getWebSocketApprovalKey(): Promise<string> {
    try {
      const headers = await this.getHeaders('');
      delete headers.tr_id; // approval key 요청시에는 tr_id 불필요
      
      const response = await this.api.post('/oauth2/Approval', {
        grant_type: 'client_credentials',
        appkey: kisApiConfig.appKey,
        secretkey: kisApiConfig.appSecret
      }, { headers });

      return response.data.approval_key;
    } catch (error) {
      logger.error('Failed to get WebSocket approval key:', error);
      throw error;
    }
  }
}