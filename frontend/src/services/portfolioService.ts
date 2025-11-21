import api from './api';
import stockService from './stockService';
import axios from 'axios';

export interface PortfolioSummary {
  cash: number;
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
  holdingsCount: number;
  cashWeight: number;
}

export interface Portfolio {
  cash: number;
  totalValue: number;
  totalInvestedAmount: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
  holdings: Holding[];
  cashWeight: number;
}

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  weight: number;
}

export interface PortfolioPerformance {
  currentValue: number;
  startValue: number;
  absoluteReturn: number;
  percentReturn: number;
  period: string;
  startDate: string;
  endDate: string;
}

export interface ValueHistory {
  date: string;
  value: number;
}

// Cache for portfolio data
const SUMMARY_CACHE_TTL = 30000; // 30 seconds
const PORTFOLIO_CACHE_TTL = 60000; // 60 seconds
let summaryCache: { data: PortfolioSummary | null; timestamp: number } | null = null;
let portfolioCache: { data: Portfolio | null; timestamp: number } | null = null;

class PortfolioService {
  // 포트폴리오 요약 정보 조회 (경량)
  async getPortfolioSummary(): Promise<PortfolioSummary> {
    try {
      // Check cache first
      if (summaryCache && Date.now() - summaryCache.timestamp < SUMMARY_CACHE_TTL) {
        return summaryCache.data!;
      }

      const response = await api.get('/portfolio/summary');
      const summary = response.data.data;
      
      // Update cache
      summaryCache = { data: summary, timestamp: Date.now() };
      
      return summary;
    } catch (error) {
      console.error('Failed to fetch portfolio summary:', error);
      throw error;
    }
  }

  // 전체 포트폴리오 조회 (상세)
  async getPortfolio(): Promise<Portfolio> {
    try {
      // Check cache first
      if (portfolioCache && Date.now() - portfolioCache.timestamp < PORTFOLIO_CACHE_TTL) {
        return portfolioCache.data!;
      }

      const response = await api.getPortfolio();
      const portfolio = response.data;
      
      // Update cache
      portfolioCache = { data: portfolio, timestamp: Date.now() };
      
      return portfolio;
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      throw error;
    }
  }

  // 보유 종목 조회
  async getHoldings(): Promise<Holding[]> {
    try {
      const response = await api.getHoldings();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch holdings:', error);
      throw error;
    }
  }

  // 포트폴리오 성과 조회
  async getPortfolioPerformance(period: string): Promise<PortfolioPerformance> {
    try {
      const response = await api.getPortfolioPerformance(period);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch portfolio performance:', error);
      throw error;
    }
  }

  // 포트폴리오 가치 히스토리 조회
  async getValueHistory(period: string): Promise<ValueHistory[]> {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/portfolio/value-history`, {
        params: { period },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch value history:', error);
      throw error;
    }
  }

  // 대시보드용 최적화된 데이터 로드
  async getDashboardData() {
    try {
      // 병렬로 필요한 데이터 로드
      const [summary, valueHistory] = await Promise.all([
        this.getPortfolioSummary(),
        this.getValueHistory('1M')
      ]);

      // 보유 종목의 실시간 가격만 별도로 업데이트
      let holdings: Holding[] = [];
      if (summary.holdingsCount > 0) {
        const portfolio = await this.getPortfolio();
        holdings = portfolio.holdings;
        
        // 배치 API로 실시간 가격 업데이트
        const symbols = holdings.map(h => h.symbol);
        const prices = await stockService.getBatchPrices(symbols);
        
        // 가격 업데이트
        const priceMap = new Map(prices.map(p => [p.symbol, p]));
        holdings.forEach(holding => {
          const price = priceMap.get(holding.symbol);
          if (price) {
            holding.currentPrice = price.currentPrice;
            holding.currentValue = holding.quantity * price.currentPrice;
            holding.profitLoss = holding.currentValue - holding.totalCost;
            holding.profitLossPercent = (holding.profitLoss / holding.totalCost) * 100;
            holding.dayChange = (price.currentPrice - price.previousClose) * holding.quantity;
            holding.dayChangePercent = price.changePercent;
          }
        });
      }

      return {
        summary,
        holdings: holdings.slice(0, 5), // Top 5 holdings for dashboard
        valueHistory,
      };
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw error;
    }
  }

  // 캐시 클리어
  clearCache() {
    summaryCache = null;
    portfolioCache = null;
  }

  // 포트폴리오 차트 데이터 형식 변환
  formatPortfolioChartData(history: ValueHistory[]) {
    return {
      labels: history.map(item => new Date(item.date).toLocaleDateString()),
      datasets: [
        {
          label: '포트폴리오 가치',
          data: history.map(item => item.value),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
        },
      ],
    };
  }

  // 포트폴리오 구성 파이 차트 데이터
  formatHoldingsDistribution(holdings: Holding[], cash: number) {
    const data = [
      ...holdings.map(h => ({
        name: h.name,
        value: h.currentValue,
        weight: h.weight,
      })),
      {
        name: '현금',
        value: cash,
        weight: (cash / (cash + holdings.reduce((sum, h) => sum + h.currentValue, 0))) * 100,
      },
    ];

    return {
      labels: data.map(d => d.name),
      datasets: [
        {
          data: data.map(d => d.value),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
        },
      ],
    };
  }

  // 수익률 계산 헬퍼
  calculateReturns(portfolio: Portfolio) {
    const totalReturn = portfolio.totalProfitLossPercent;
    const dailyReturn = portfolio.dailyChangePercent;
    
    // 연환산 수익률 (간단 계산)
    const daysSinceStart = 365; // 실제로는 시작일 기준으로 계산 필요
    const annualizedReturn = totalReturn * (365 / daysSinceStart);

    return {
      total: totalReturn,
      daily: dailyReturn,
      annualized: annualizedReturn,
    };
  }
}

export default new PortfolioService();