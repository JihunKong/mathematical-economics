import winston from 'winston';
import path from 'path';

const logDir = 'logs'에러가 발생했습니다'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular Reference]'에러가 발생했습니다'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss'에러가 발생했습니다'error.log'),
      level: 'error'에러가 발생했습니다'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  exitOnError: false
});