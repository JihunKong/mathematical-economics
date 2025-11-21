import { prisma } from '../config/database';
import { logger } from '../utils/logger'에러가 발생했습니다'desc'에러가 발생했습니다'desc' },
        distinct: ['symbol'에러가 발생했습니다'Failed to get multiple stock prices from database:'에러가 발생했습니다'manual',
            timestamp: new Date()
          }
        });
      }

      logger.info(`Stock ${symbol} price manually updated`);
      return true;
    } catch (error: any) {
      logger.error(`Failed to manually update stock price for ${symbol}:`, error.message);
      return false;
    }
  }
}