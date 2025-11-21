import axios, { AxiosInstance } from 'axios';
import { kisApiConfig } from '../config/kisApi';
import { logger } from '../utils/logger';
// import crypto from 'crypto'에러가 발생했습니다'Content-Type': 'application/json; charset=utf-8'에러가 발생했습니다'/oauth2/tokenP', {
        grant_type: 'client_credentials'에러가 발생했습니다'KIS API access token refreshed');
      return this.accessToken;
    } catch (error) {
      logger.error('Failed to get KIS API access token:', error);
      throw new Error('KIS API 인증 실패'에러가 발생했습니다'authorization': `Bearer ${token}`,
      'appkey': kisApiConfig.appKey,
      'appsecret': kisApiConfig.appSecret,
      'tr_id': trId,
      'tr_cont': isContinuous ? 'Y' : 'N',
      'custtype': 'P', // 개인
      'content-type': 'application/json; charset=utf-8'에러가 발생했습니다'VTTW8308R' : 'FHKST01010100');
      
      const response = await this.api.get('/uapi/domestic-stock/v1/quotations/inquire-price', {
        headers,
        params: {
          FID_COND_MRKT_DIV_CODE: 'J', // 주식
          FID_INPUT_ISCD: stockCode
        }
      });

      if (response.data.rt_cd !== '0'에러가 발생했습니다'CTPF1002R');
      
      const response = await this.api.get('/uapi/domestic-stock/v1/quotations/search-stock-info', {
        headers,
        params: {
          PRDT_TYPE_CD: '300', // 주식
          PDNO: stockCode
        }
      });

      if (response.data.rt_cd !== '0'에러가 발생했습니다'D' | 'W' | 'M' = 'D') {
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

      if (response.data.rt_cd !== '0'에러가 발생했습니다'0001') { // 0001: 코스피, 1001: 코스닥
    try {
      const headers = await this.getHeaders('CTPF1604R');
      
      const response = await this.api.get('/uapi/domestic-stock/v1/quotations/inquire-member'에러가 발생했습니다'0'에러가 발생했습니다'FHKST01010200');
      
      const response = await this.api.get('/uapi/domestic-stock/v1/quotations/inquire-asking-price-exp-ccn', {
        headers,
        params: {
          FID_COND_MRKT_DIV_CODE: 'J',
          FID_INPUT_ISCD: stockCode
        }
      });

      if (response.data.rt_cd !== '0'에러가 발생했습니다'ws://ops.koreainvestment.com:31000';
    }
    return 'ws://ops.koreainvestment.com:21000'에러가 발생했습니다''에러가 발생했습니다'/oauth2/Approval', {
        grant_type: 'client_credentials'에러가 발생했습니다'Failed to get WebSocket approval key:', error);
      throw error;
    }
  }
}