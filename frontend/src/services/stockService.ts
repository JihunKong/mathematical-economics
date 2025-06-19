import api from './api';

export interface StockPrice {
  symbol: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  changeAmount: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  timestamp: string;
}

export interface ChartData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockDetail {
  symbol: string;
  name: string;
  market: string;
  sector?: string;
  description?: string;
  marketCap?: number;
  per?: number;
  eps?: number;
  dividend?: number;
}

export type ChartPeriod = '1D' | '1W' | '1M' | '3M' | '1Y';

// Price cache to prevent duplicate API calls
const priceCache = new Map<string, { data: StockPrice; timestamp: number }>();
const CACHE_TTL = 10000; // 10 seconds cache

class StockService {
  // 주식 목록 조회
  async getStocks(market?: string) {
    try {
      const response = await api.getStocks(market);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
      throw error;
    }
  }

  // 주식 검색
  async searchStocks(query: string, market?: string) {
    try {
      const response = await api.searchStocks(query, market);
      return response.data;
    } catch (error) {
      console.error('Failed to search stocks:', error);
      throw error;
    }
  }

  // 주식 상세 정보 조회
  async getStockDetail(symbol: string): Promise<StockDetail> {
    try {
      const response = await api.getStock(symbol);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch stock detail:', error);
      throw error;
    }
  }

  // 실시간 가격 조회 (캐싱 적용)
  async getRealtimePrice(symbol: string): Promise<StockPrice> {
    try {
      // Check cache first
      const cached = priceCache.get(symbol);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }

      const response = await api.getStockPrice(symbol);
      const priceData = response.data;
      
      // Cache the result
      priceCache.set(symbol, { data: priceData, timestamp: Date.now() });
      
      return priceData;
    } catch (error) {
      console.error('Failed to fetch realtime price:', error);
      throw error;
    }
  }

  // 차트 데이터 조회
  async getChartData(symbol: string, period: ChartPeriod): Promise<ChartData[]> {
    try {
      // Try new chart API first
      const response = await api.get(`/chart/${symbol}`, {
        params: { period }
      });
      return response.data.data;
    } catch (error) {
      // Fallback to real-stocks API
      try {
        const fallbackResponse = await api.getStockChart(symbol, period);
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error('Failed to fetch chart data:', fallbackError);
        throw fallbackError;
      }
    }
  }

  // 여러 종목의 실시간 가격 조회 (배치 API 사용)
  async getBatchPrices(symbols: string[]): Promise<StockPrice[]> {
    try {
      if (symbols.length === 0) return [];

      // Remove duplicates
      const uniqueSymbols = [...new Set(symbols)];
      
      // Check cache and separate cached vs non-cached symbols
      const now = Date.now();
      const cachedPrices: StockPrice[] = [];
      const symbolsToFetch: string[] = [];

      uniqueSymbols.forEach(symbol => {
        const cached = priceCache.get(symbol);
        if (cached && now - cached.timestamp < CACHE_TTL) {
          cachedPrices.push(cached.data);
        } else {
          symbolsToFetch.push(symbol);
        }
      });

      // If all are cached, return immediately
      if (symbolsToFetch.length === 0) {
        return cachedPrices;
      }

      // Use batch API endpoint
      const response = await api.post('/stocks/prices/multiple', {
        symbols: symbolsToFetch
      });

      const fetchedPrices = response.data.data || [];
      
      // Cache the fetched prices
      fetchedPrices.forEach((price: StockPrice) => {
        priceCache.set(price.symbol, { data: price, timestamp: now });
      });

      // Combine cached and fetched prices
      return [...cachedPrices, ...fetchedPrices];
    } catch (error) {
      console.error('Failed to fetch batch prices:', error);
      // Fallback to individual calls only if batch API fails
      // But limit concurrent requests to prevent 429 errors
      const batchSize = 5;
      const results: StockPrice[] = [];
      
      for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize);
        const promises = batch.map(symbol => 
          this.getRealtimePrice(symbol).catch(err => {
            console.error(`Failed to fetch price for ${symbol}:`, err);
            return null;
          })
        );
        
        const batchResults = await Promise.all(promises);
        results.push(...batchResults.filter((r): r is StockPrice => r !== null));
        
        // Add a small delay between batches to prevent rate limiting
        if (i + batchSize < symbols.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      return results;
    }
  }

  // Clear price cache
  clearPriceCache() {
    priceCache.clear();
  }

  // 차트 데이터 형식 변환 (Chart.js용)
  formatChartDataForDisplay(data: ChartData[]) {
    return {
      labels: data.map(item => new Date(item.timestamp).toLocaleDateString()),
      datasets: [
        {
          label: '종가',
          data: data.map(item => item.close),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
        },
      ],
    };
  }

  // 캔들스틱 차트 데이터 형식 변환
  formatCandlestickData(data: ChartData[]) {
    return data.map(item => ({
      x: new Date(item.timestamp).getTime(),
      o: item.open,
      h: item.high,
      l: item.low,
      c: item.close,
    }));
  }

  // 거래량 차트 데이터 형식 변환
  formatVolumeData(data: ChartData[]) {
    return {
      labels: data.map(item => new Date(item.timestamp).toLocaleDateString()),
      datasets: [
        {
          label: '거래량',
          data: data.map(item => item.volume),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  }

  // 가격 변동률 계산
  calculatePriceChange(currentPrice: number, previousClose: number) {
    const changeAmount = currentPrice - previousClose;
    const changePercent = (changeAmount / previousClose) * 100;
    return {
      changeAmount,
      changePercent,
      isPositive: changeAmount > 0,
    };
  }

  // 이동평균 계산
  calculateMovingAverage(data: ChartData[], period: number) {
    const result = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data
        .slice(i - period + 1, i + 1)
        .reduce((acc, item) => acc + item.close, 0);
      result.push({
        timestamp: data[i].timestamp,
        value: sum / period,
      });
    }
    return result;
  }
}

export default new StockService();