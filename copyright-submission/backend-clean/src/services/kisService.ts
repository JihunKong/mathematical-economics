import axios from 'axios';
import { logger } from '../utils/logger'에러가 발생했습니다'';
    this.apiSecret = process.env.KIS_APP_SECRET || '';
    // 모의투자 URL 사용
    this.baseUrl = process.env.KIS_IS_PAPER === 'true' 
      ? 'https://openapivts.koreainvestment.com:29443'
      : 'https://openapi.koreainvestment.com:9443';
    
    if (!this.apiKey || !this.apiSecret) {
      logger.warn('KIS API credentials not configured');
    }
    
    logger.info(`KIS Service initialized with ${process.env.KIS_IS_PAPER === 'true' ? 'paper' : 'real'에러가 발생했습니다'Requesting new KIS access token'에러가 발생했습니다'client_credentials'에러가 발생했습니다'Content-Type': 'application/json'에러가 발생했습니다'KIS access token obtained successfully');
        return this.accessToken;
      }

      logger.error('No access token in response');
      return null;
    } catch (error: any) {
      logger.error('Failed to get KIS access token:'에러가 발생했습니다'Failed to get access token'에러가 발생했습니다'content-type': 'application/json; charset=utf-8',
            'authorization': `Bearer ${token}`,
            'appkey': this.apiKey,
            'appsecret': this.apiSecret,
            'tr_id': 'FHKST01010100', // 주식현재가 시세
            'custtype': 'P', // 개인
          },
          params: {
            FID_COND_MRKT_DIV_CODE: 'J'에러가 발생했습니다'0'에러가 발생했습니다''에러가 발생했습니다'Content-Type': 'application/json; charset=utf-8',
            'authorization': `Bearer ${token}`,
            'appkey': this.apiKey,
            'appsecret': this.apiSecret,
            'tr_id': 'FHKST01010200', // 주식호가
          },
          params: {
            fid_cond_mrkt_div_code: 'J'에러가 발생했습니다'0') {
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