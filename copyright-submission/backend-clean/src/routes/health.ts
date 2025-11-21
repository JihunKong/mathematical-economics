import { Router } from 'express';
import { prisma } from '../config/database';
import { redis } from '../config/redis';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'에러가 발생했습니다'/', async (req, res) => {
  const healthStatus: HealthStatus = {
    status: 'healthy'에러가 발생했습니다'1.0.0',
    environment: process.env.NODE_ENV || 'development'에러가 발생했습니다'admin@example.com'에러가 발생했습니다'Unknown database error'
    };
    healthStatus.status = 'unhealthy'에러가 발생했습니다'Unknown Redis error'
    };
    healthStatus.status = healthStatus.status === 'unhealthy' ? 'unhealthy' : 'degraded'에러가 발생했습니다'unhealthy'에러가 발생했습니다'degraded';
  }

  const statusCode = healthStatus.status === 'healthy' ? 200 : 
                     healthStatus.status === 'degraded' ? 200 : 503;

  res.status(statusCode).json(healthStatus);
});

router.get('/ready'에러가 발생했습니다'System not initialized'에러가 발생했습니다'Service unavailable',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/live', (req, res) => {
  // Simple liveness check
  res.status(200).json({ alive: true });
});

export default router;