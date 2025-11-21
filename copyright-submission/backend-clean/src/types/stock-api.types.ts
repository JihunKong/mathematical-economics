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
  month: 'month'에러가 발생했습니다'STK';
  KOSDAQ: 'KSQ'에러가 발생했습니다'KRX' | 'NAVER' | 'YAHOO' | 'MOCK'에러가 발생했습니다'1D' | '1W' | '1M' | '3M' | '6M' | '1Y';
  includeRealtime?: boolean;
}

// API 에러 타입
export interface ApiError {
  code: string;
  message: string;
  source: string;
  timestamp: Date;
}