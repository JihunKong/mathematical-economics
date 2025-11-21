import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger'에러가 발생했습니다'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'에러가 발생했습니다'production'에러가 발생했습니다'development') {
    logger.debug(`Query ${params.model}.${params.action} took ${after - before}ms`);
  }
  
  return result;
});