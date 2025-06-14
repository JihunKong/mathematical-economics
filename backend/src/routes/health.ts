import { Router } from 'express';
import { prisma } from '../config/database';
import { redis } from '../config/redis';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: {
      connected: boolean;
      userCount?: number;
      stockCount?: number;
      portfolioCount?: number;
      error?: string;
    };
    redis: {
      connected: boolean;
      error?: string;
    };
    initialization: {
      hasAdmin: boolean;
      hasStocks: boolean;
      hasPortfolios: boolean;
      isReady: boolean;
    };
  };
  version: string;
  environment: string;
}

router.get('/', async (req, res) => {
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        connected: false
      },
      redis: {
        connected: false
      },
      initialization: {
        hasAdmin: false,
        hasStocks: false,
        hasPortfolios: false,
        isReady: false
      }
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  try {
    // Check database connection
    const [userCount, stockCount, portfolioCount] = await Promise.all([
      prisma.user.count(),
      prisma.stock.count(),
      prisma.portfolio.count()
    ]);

    healthStatus.services.database = {
      connected: true,
      userCount,
      stockCount,
      portfolioCount
    };

    // Check for admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    healthStatus.services.initialization.hasAdmin = !!adminUser;

    // Check initialization status
    healthStatus.services.initialization.hasStocks = stockCount > 0;
    healthStatus.services.initialization.hasPortfolios = portfolioCount > 0;
    healthStatus.services.initialization.isReady = 
      healthStatus.services.initialization.hasAdmin && 
      healthStatus.services.initialization.hasStocks;

  } catch (error) {
    healthStatus.services.database = {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
    healthStatus.status = 'unhealthy';
  }

  try {
    // Check Redis connection
    await redis.ping();
    healthStatus.services.redis.connected = true;
  } catch (error) {
    healthStatus.services.redis = {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown Redis error'
    };
    healthStatus.status = healthStatus.status === 'unhealthy' ? 'unhealthy' : 'degraded';
  }

  // Determine overall status
  if (!healthStatus.services.database.connected) {
    healthStatus.status = 'unhealthy';
  } else if (!healthStatus.services.redis.connected || !healthStatus.services.initialization.isReady) {
    healthStatus.status = 'degraded';
  }

  const statusCode = healthStatus.status === 'healthy' ? 200 : 
                     healthStatus.status === 'degraded' ? 200 : 503;

  res.status(statusCode).json(healthStatus);
});

router.get('/ready', async (req, res) => {
  try {
    // Quick readiness check
    const [hasUsers, hasStocks] = await Promise.all([
      prisma.user.count().then(count => count > 0),
      prisma.stock.count().then(count => count > 0)
    ]);

    if (hasUsers && hasStocks) {
      res.status(200).json({ ready: true });
    } else {
      res.status(503).json({ 
        ready: false, 
        message: 'System not initialized',
        hasUsers,
        hasStocks
      });
    }
  } catch (error) {
    res.status(503).json({ 
      ready: false, 
      message: 'Service unavailable',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/live', (req, res) => {
  // Simple liveness check
  res.status(200).json({ alive: true });
});

export default router;