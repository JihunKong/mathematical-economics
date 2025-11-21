import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api'에러가 발생했습니다'Content-Type': 'application/json'에러가 발생했습니다'accessToken'에러가 발생했습니다'refreshToken');
            if (refreshToken) {
              const response = await this.api.post('/auth/refresh'에러가 발생했습니다'accessToken'에러가 발생했습니다'accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            
            
            const isInitializing = !document.querySelector('[data-app-initialized]');
            if (!window.location.pathname.includes('/login') && !isInitializing) {
              window.location.href = '/login'에러가 발생했습니다'알 수 없는 오류가 발생했습니다.';

        if (errorData?.code === 'PRICE_NOT_FRESH'에러가 발생했습니다'500px',
              whiteSpace: 'pre-line' // Preserve line breaks
            }
          });
        } else if (errorData?.code === 'WATCHLIST_REQUIRED'에러가 발생했습니다'400px',
              whiteSpace: 'pre-line'
            }
          });
        } else if (errorData?.code === 'STOCK_NOT_ALLOWED'에러가 발생했습니다'500px',
              whiteSpace: 'pre-line'에러가 발생했습니다'/auth/login'에러가 발생했습니다'/auth/register'에러가 발생했습니다'/auth/logout'에러가 발생했습니다'/stocks'에러가 발생했습니다'/stocks/search'에러가 발생했습니다'buyStock is disabled - use direct fetch in components');
  }

  async sellStock(symbol: string, quantity: number, reason?: string) {
    throw new Error('sellStock is disabled - use direct fetch in components');
  }

  async getTransactionHistory(limit?: number) {
    const response = await this.api.get('/trading/history'에러가 발생했습니다'/portfolio');
    return response.data;
  }

  async getHoldings() {
    const response = await this.api.get('/portfolio/holdings'에러가 발생했습니다'/portfolio/performance'에러가 발생했습니다'/portfolio/value-history'에러가 발생했습니다'/teacher/classes'에러가 발생했습니다'/teacher/classes'에러가 발생했습니다'all' | 'month' | 'week' = 'all') {
    const response = await this.api.get('/leaderboard', { params: { timeRange } });
    return response.data;
  }

  // Generic API methods for direct access
  get(url: string, config?: any) {
    return this.api.get(url, config);
  }

  post(url: string, data?: any, config?: any) {
    return this.api.post(url, data, config);
  }

  put(url: string, data?: any, config?: any) {
    return this.api.put(url, data, config);
  }

  patch(url: string, data?: any, config?: any) {
    return this.api.patch(url, data, config);
  }

  delete(url: string, config?: any) {
    return this.api.delete(url, config);
  }
}

export default new ApiService();