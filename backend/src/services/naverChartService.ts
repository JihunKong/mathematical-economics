import axios from 'axios';
import { logger } from '../utils/logger';
import iconv from 'iconv-lite';

interface NaverChartItem {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface NaverChartResponse {
  symbol: string;
  chartdata: NaverChartItem[];
}

export class NaverChartService {
  private readonly baseUrl = 'https://fchart.stock.naver.com/sise.nhn';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1시간

  /**
   * 네이버 금융에서 차트 데이터 조회
   */
  async getChartData(
    symbol: string,
    timeframe: 'day' | 'week' | 'month' = 'day',
    count: number = 60
  ): Promise<NaverChartItem[]> {
    try {
      const cacheKey = `naver-chart:${symbol}:${timeframe}:${count}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        logger.info(`Returning cached Naver chart data for ${symbol}`);
        return cached.data;
      }

      const params = {
        symbol,
        timeframe,
        count,
        requestType: 0
      };

      const response = await axios.get(this.baseUrl, {
        params,
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://finance.naver.com',
        },
        timeout: 10000,
      });

      // 네이버는 EUC-KR 인코딩을 사용하므로 UTF-8로 변환
      const decodedData = iconv.decode(response.data, 'euc-kr');
      const chartData = this.parseChartData(decodedData);

      this.cache.set(cacheKey, { 
        data: chartData, 
        timestamp: Date.now() 
      });

      return chartData;
    } catch (error: any) {
      logger.error(`Failed to fetch Naver chart data for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * 네이버 차트 응답 파싱
   */
  private parseChartData(rawData: string): NaverChartItem[] {
    try {
      // XML 형식의 데이터 파싱
      const items: NaverChartItem[] = [];
      const lines = rawData.split('\n');
      
      for (const line of lines) {
        const match = line.match(/<item data="([^"]+)"/);
        if (match) {
          const values = match[1].split('|');
          if (values.length >= 6) {
            items.push({
              date: this.parseNaverDate(values[0]),
              open: parseInt(values[1]),
              high: parseInt(values[2]),
              low: parseInt(values[3]),
              close: parseInt(values[4]),
              volume: parseInt(values[5]),
            });
          }
        }
      }

      return items.reverse(); // 최신 날짜가 뒤에 오도록
    } catch (error: any) {
      logger.error('Failed to parse Naver chart data:', error);
      return [];
    }
  }

  /**
   * 네이버 날짜 형식 변환 (YYYYMMDD -> YYYY-MM-DD)
   */
  private parseNaverDate(dateStr: string): string {
    if (dateStr.length === 8) {
      return `${dateStr.substr(0, 4)}-${dateStr.substr(4, 2)}-${dateStr.substr(6, 2)}`;
    }
    return dateStr;
  }

  /**
   * 차트 데이터를 공통 형식으로 변환
   */
  formatChartData(data: NaverChartItem[]): any[] {
    return data.map(item => ({
      date: new Date(item.date),
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    }));
  }

  /**
   * 캐시 초기화
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('Naver chart cache cleared');
  }
}