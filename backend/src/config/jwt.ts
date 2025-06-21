import { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// JWT 시크릿 자동 생성 및 관리
function getOrCreateJwtSecret(): string {
  const secretFile = path.join(__dirname, '../../.jwt-secret');
  
  // 환경변수에 시크릿이 있으면 우선 사용
  if (process.env.JWT_SECRET && process.env.JWT_SECRET !== 'your-secret-key') {
    return process.env.JWT_SECRET;
  }
  
  // 파일에 저장된 시크릿이 있으면 사용
  try {
    if (fs.existsSync(secretFile)) {
      const savedSecret = fs.readFileSync(secretFile, 'utf8').trim();
      if (savedSecret) {
        console.log('Using saved JWT secret from file');
        return savedSecret;
      }
    }
  } catch (error) {
    console.error('Error reading JWT secret file:', error);
  }
  
  // 새로운 시크릿 생성
  const newSecret = crypto.randomBytes(32).toString('base64');
  
  // 파일에 저장 (production에서도 재시작 시 유지)
  try {
    fs.writeFileSync(secretFile, newSecret);
    console.log('Generated and saved new JWT secret');
  } catch (error) {
    console.error('Error saving JWT secret to file:', error);
  }
  
  return newSecret;
}

export const jwtConfig = {
  secret: getOrCreateJwtSecret(),
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshExpiresIn: '30d',
};

export const jwtSignOptions: SignOptions = {
  expiresIn: jwtConfig.expiresIn as any,
  algorithm: 'HS256',
};