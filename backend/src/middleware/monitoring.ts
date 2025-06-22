import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { cacheService, type CacheStats } from '../services/cacheService-improved';
import os from 'os';
import { prisma } from '../config/database';

interface RequestMetrics {
  path: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userId?: string;
}

interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    free: number;
    used: number;
    percentage: number;
  };
  process: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    pid: number;
  };
  app: {
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
    activeConnections: number;
  };
}

class MonitoringService {
  private requestMetrics: RequestMetrics[] = [];
  private activeRequests = new Map<string, number>();
  private errorCount = 0;
  private totalRequests = 0;

  // 요청 시작 기록
  startRequest(req: Request): string {
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.activeRequests.set(requestId, Date.now());
    return requestId;
  }

  // 요청 완료 기록
  endRequest(requestId: string, req: Request, res: Response): void {
    const startTime = this.activeRequests.get(requestId);
    if (!startTime) return;

    const responseTime = Date.now() - startTime;
    this.activeRequests.delete(requestId);

    const metric: RequestMetrics = {
      path: req.path,
      method: req.method,
      statusCode: res.statusCode,
      responseTime,
      timestamp: new Date(),
      userId: (req as any).user?.id,
    };

    this.requestMetrics.push(metric);
    this.totalRequests++;

    if (res.statusCode >= 500) {
      this.errorCount++;
    }

    // 메트릭 로그 (주요 경로만)
    if (responseTime > 1000 || res.statusCode >= 400) {
      logger.warn('Slow or failed request', {
        ...metric,
        warning: responseTime > 1000 ? 'SLOW_REQUEST' : 'ERROR_RESPONSE',
      });
    }

    // 1시간 이상 된 메트릭 정리
    this.cleanOldMetrics();
  }

  // 시스템 메트릭 수집
  async getSystemMetrics(): Promise<SystemMetrics> {
    const cpuUsage = process.cpuUsage();
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    // 최근 1분간 요청 수
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentRequests = this.requestMetrics.filter(
      m => m.timestamp > oneMinuteAgo
    );

    // 평균 응답 시간
    const avgResponseTime = recentRequests.length > 0
      ? recentRequests.reduce((sum, m) => sum + m.responseTime, 0) / recentRequests.length
      : 0;

    // 에러율
    const errorRate = this.totalRequests > 0
      ? (this.errorCount / this.totalRequests) * 100
      : 0;

    return {
      timestamp: new Date(),
      cpu: {
        usage: (cpuUsage.user + cpuUsage.system) / 1000000, // 초 단위
        loadAverage: os.loadavg(),
      },
      memory: {
        total: totalMemory,
        free: freeMemory,
        used: usedMemory,
        percentage: (usedMemory / totalMemory) * 100,
      },
      process: {
        uptime: process.uptime(),
        memoryUsage,
        pid: process.pid,
      },
      app: {
        requestsPerMinute: recentRequests.length,
        averageResponseTime: Math.round(avgResponseTime),
        errorRate: Math.round(errorRate * 100) / 100,
        activeConnections: this.activeRequests.size,
      },
    };
  }

  // 데이터베이스 상태 확인
  async getDatabaseMetrics() {
    try {
      const startTime = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;

      // 연결 수 확인 (PostgreSQL 전용)
      const connections = await prisma.$queryRaw<any[]>`
        SELECT count(*) as active_connections 
        FROM pg_stat_activity 
        WHERE state = 'active'
      `;

      return {
        status: 'healthy',
        responseTime,
        activeConnections: connections[0]?.active_connections || 0,
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  // 캐시 메트릭
  getCacheMetrics() {
    return cacheService.getStats();
  }

  // 오래된 메트릭 정리
  private cleanOldMetrics(): void {
    const oneHourAgo = new Date(Date.now() - 3600000);
    this.requestMetrics = this.requestMetrics.filter(
      m => m.timestamp > oneHourAgo
    );
  }

  // 상태 요약
  async getHealthSummary() {
    const systemMetrics = await this.getSystemMetrics();
    const dbMetrics = await this.getDatabaseMetrics();
    const cacheMetrics = this.getCacheMetrics();

    const isHealthy = 
      systemMetrics.memory.percentage < 90 &&
      systemMetrics.app.errorRate < 5 &&
      dbMetrics.status === 'healthy' &&
      systemMetrics.app.averageResponseTime < 2000;

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date(),
      system: systemMetrics,
      database: dbMetrics,
      cache: cacheMetrics,
      alerts: this.getAlerts(systemMetrics, dbMetrics),
    };
  }

  // 알림 생성
  private getAlerts(systemMetrics: SystemMetrics, dbMetrics: any): string[] {
    const alerts: string[] = [];

    if (systemMetrics.memory.percentage > 90) {
      alerts.push('HIGH_MEMORY_USAGE');
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
      alerts.push('HIGH_ACTIVE_CONNECTIONS');
    }

    return alerts;
  }
}

// 싱글톤 인스턴스
export const monitoringService = new MonitoringService();

// 모니터링 미들웨어
export function monitoringMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = monitoringService.startRequest(req);
  
  // 응답 완료 시 메트릭 기록
  const originalSend = res.send;
  res.send = function(data: any) {
    monitoringService.endRequest(requestId, req, res);
    return originalSend.call(this, data);
  };

  next();
}

// 상태 확인 엔드포인트
export async function healthCheckHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const health = await monitoringService.getHealthSummary();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
    });
  }
}

// 메트릭 엔드포인트 (관리자 전용)
export async function metricsHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const metrics = await monitoringService.getSystemMetrics();
    const dbMetrics = await monitoringService.getDatabaseMetrics();
    const cacheMetrics = monitoringService.getCacheMetrics();

    res.json({
      system: metrics,
      database: dbMetrics,
      cache: cacheMetrics,
    });
  } catch (error) {
    logger.error('Metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get metrics',
    });
  }
}