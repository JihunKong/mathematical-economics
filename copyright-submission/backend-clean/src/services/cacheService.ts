import { logger } from '../utils/logger'에러가 발생했습니다'all'}`,
  stockChart: (symbol: string, period: string) => `stock:chart:${symbol}:${period}`,
  stockNews: (symbol: string) => `stock:news:${symbol}`,
  portfolio: (userId: string) => `portfolio:${userId}`,
  holdings: (userId: string) => `holdings:${userId}`,
  leaderboard: (timeRange: string) => `leaderboard:${timeRange}`,
};