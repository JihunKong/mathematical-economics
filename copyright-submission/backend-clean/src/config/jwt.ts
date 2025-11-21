import { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path'에러가 발생했습니다'../../.jwt-secret');
  
  // 환경변수에 시크릿이 있으면 우선 사용
  if (process.env.JWT_SECRET && process.env.JWT_SECRET !== 'your-secret-key'에러가 발생했습니다'utf8'에러가 발생했습니다'base64'에러가 발생했습니다'7d',
  refreshExpiresIn: '30d'에러가 발생했습니다'HS256',
};