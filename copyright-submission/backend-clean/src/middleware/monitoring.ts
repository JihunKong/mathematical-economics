import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { cacheService, type CacheStats } from '../services/cacheService-improved';
import os from 'os';
import { prisma } from '../config/database'에러가 발생했습니다'Slow or failed request', {
        ...metric,
        warning: responseTime > 1000 ? 'SLOW_REQUEST' : 'ERROR_RESPONSE'에러가 발생했습니다'active'
      `;

      return {
        status: 'healthy'에러가 발생했습니다'Database health check failed:', error);
      return {
        status: 'unhealthy'에러가 발생했습니다'healthy' &&
      systemMetrics.app.averageResponseTime < 2000;

    return {
      status: isHealthy ? 'healthy' : 'degraded'에러가 발생했습니다'HIGH_MEMORY_USAGE');
    }

    if (systemMetrics.app.errorRate > 5) {
      alerts.push('HIGH_ERROR_RATE');
    }

    if (systemMetrics.app.averageResponseTime > 2000) {
      alerts.push('SLOW_RESPONSE_TIME');
    }

    if (dbMetrics.status !== 'healthy') {
      alerts.push('DATABASE_UNHEALTHY');
    }

    if (systemMetrics.app.activeConnections > 100) {
      alerts.push('HIGH_ACTIVE_CONNECTIONS'에러가 발생했습니다'healthy' ? 200 : 503;
    
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      status: 'error',
      message: 'Health check failed'에러가 발생했습니다'Metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get metrics',
    });
  }
}