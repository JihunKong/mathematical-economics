import { SignOptions } from 'jsonwebtoken';

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshExpiresIn: '30d',
};

export const jwtSignOptions: SignOptions = {
  expiresIn: jwtConfig.expiresIn as any,
  algorithm: 'HS256',
};