/**
 * 주식 API 관련 타입 정의
 */

// 네이버 차트 API 응답 타입
export interface NaverChartItem {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NaverChartTimeframe {
  day: 'day';
  week: 'week';
  month: 'month';
}

// KRX API 응답 타입
export interface KRXStockData {
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

export interface KRXMarketType {
  KOSPI: 'STK';
  KOSDAQ: 'KSQ';
}

// 통합 주식 데이터 타입
export interface UnifiedStockData {
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
  timestamp: Date;
  source: 'KRX' | 'NAVER' | 'YAHOO' | 'MOCK';
}

// 차트 데이터 타입
export interface ChartDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartDataRequest {
  symbol: string;
  period: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';
  includeRealtime?: boolean;
}

// API 에러 타입
export interface ApiError {
  code: string;
  message: string;
  source: string;
  timestamp: Date;
}