export interface KISApiConfig {
  appKey: string;
  appSecret: string;
  baseUrl: string;
  accountNumber: string;
  accountProductCode: string;
  isPaper: boolean; // 모의투자 여부
}

export const kisApiConfig: KISApiConfig = {
  appKey: process.env.KIS_APP_KEY || '',
  appSecret: process.env.KIS_APP_SECRET || '',
  baseUrl: process.env.KIS_API_URL || 'https://openapi.koreainvestment.com:9443',
  accountNumber: process.env.KIS_ACCOUNT_NUMBER || '',
  accountProductCode: process.env.KIS_ACCOUNT_PRODUCT_CODE || '01',
  isPaper: process.env.KIS_IS_PAPER === 'true' // 모의투자 모드
};