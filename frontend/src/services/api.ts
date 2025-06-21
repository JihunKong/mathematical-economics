import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.api.post('/auth/refresh', { refreshToken });
              const { accessToken } = response.data.data;
              localStorage.setItem('accessToken', accessToken);
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear auth data
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            
            // Only redirect to login if not already on login page and not during initial load
            const isInitializing = !document.querySelector('[data-app-initialized]');
            if (!window.location.pathname.includes('/login') && !isInitializing) {
              window.location.href = '/login';
            }
          }
        }

        const errorData = error.response?.data as any;
        const message = errorData?.message || '알 수 없는 오류가 발생했습니다.';
        
        // Show detailed error message for specific error codes
        if (errorData?.code === 'PRICE_NOT_FRESH') {
          // For price not fresh errors, show the full detailed message
          toast.error(message, {
            duration: 8000, // Show for 8 seconds
            style: {
              maxWidth: '500px',
              whiteSpace: 'pre-line' // Preserve line breaks
            }
          });
        } else if (errorData?.code === 'WATCHLIST_REQUIRED') {
          // For watchlist required errors
          toast.error(message, {
            duration: 6000,
            style: {
              maxWidth: '400px',
              whiteSpace: 'pre-line'
            }
          });
        } else if (errorData?.code === 'STOCK_NOT_ALLOWED') {
          // For stock not allowed errors, show detailed message
          toast.error(message, {
            duration: 8000,
            style: {
              maxWidth: '500px',
              whiteSpace: 'pre-line'
            }
          });
        } else if (error.response?.status === 403 || error.response?.status === 423) {
          // For other 403/423 errors (trading restrictions), don't show toast here
          // Let the calling component handle the detailed error message
          // Do nothing - let the error propagate to the calling component
        } else {
          // Default error toast for other errors
          toast.error(message);
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(data: any) {
    const response = await this.api.post('/auth/register', data);
    return response.data;
  }

  async logout() {
    const response = await this.api.post('/auth/logout');
    return response.data;
  }

  // Stock endpoints
  async getStocks(market?: string) {
    const response = await this.api.get('/stocks', { params: { market } });
    return response.data;
  }

  async searchStocks(query: string, market?: string) {
    const response = await this.api.get('/stocks/search', { params: { q: query, market } });
    return response.data;
  }

  async getStock(symbol: string) {
    const response = await this.api.get(`/stocks/${symbol}`);
    return response.data;
  }

  async getStockPrice(symbol: string) {
    const response = await this.api.get(`/real-stocks/${symbol}/price`);
    return response.data;
  }

  async getStockChart(symbol: string, period: string) {
    const response = await this.api.get(`/real-stocks/${symbol}/chart`, { params: { period } });
    return response.data;
  }

  // Trading endpoints
  async buyStock(symbol: string, quantity: number, reason?: string) {
    const response = await this.api.post('/trading/buy', { symbol, quantity, reason });
    return response.data;
  }

  async sellStock(symbol: string, quantity: number, reason?: string) {
    const response = await this.api.post('/trading/sell', { symbol, quantity, reason });
    return response.data;
  }

  async getTransactionHistory(limit?: number) {
    const response = await this.api.get('/trading/history', { params: { limit } });
    return response.data;
  }

  // Portfolio endpoints
  async getPortfolio() {
    const response = await this.api.get('/portfolio');
    return response.data;
  }

  async getHoldings() {
    const response = await this.api.get('/portfolio/holdings');
    return response.data;
  }

  async getPortfolioPerformance(period: string) {
    const response = await this.api.get('/portfolio/performance', { params: { period } });
    return response.data;
  }

  async getPortfolioValueHistory(period: string) {
    const response = await this.api.get('/portfolio/value-history', { params: { period } });
    return response.data;
  }

  // Teacher endpoints
  async createClass(data: any) {
    const response = await this.api.post('/teacher/classes', data);
    return response.data;
  }

  async getTeacherClasses() {
    const response = await this.api.get('/teacher/classes');
    return response.data;
  }

  async getClassDetails(classId: string) {
    const response = await this.api.get(`/teacher/classes/${classId}`);
    return response.data;
  }


  async getStudentActivity(studentId: string) {
    const response = await this.api.get(`/teacher/students/${studentId}/activity`);
    return response.data;
  }

  async getClassStatistics(classId: string) {
    const response = await this.api.get(`/teacher/classes/${classId}/statistics`);
    return response.data;
  }

  async updateStudentCash(studentId: string, newCash: number) {
    const response = await this.api.patch(`/teacher/students/${studentId}/cash`, { newCash });
    return response.data;
  }

  // Leaderboard endpoints
  async getLeaderboard(timeRange: 'all' | 'month' | 'week' = 'all') {
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
