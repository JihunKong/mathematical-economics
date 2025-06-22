import { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

interface JWTKeyVersion {
  version: number;
  secret: string;
  createdAt: Date;
  expiresAt?: Date;
}

interface JWTKeyStore {
  current: JWTKeyVersion;
  previous?: JWTKeyVersion;
}

class JWTKeyManager {
  private keyStore: JWTKeyStore;
  private keyFilePath: string;
  private backupPath: string;

  constructor() {
    this.keyFilePath = path.join(__dirname, '../../.jwt-keys.json');
    this.backupPath = path.join(__dirname, '../../.jwt-keys.backup.json');
    this.keyStore = this.loadOrCreateKeys();
  }

  private loadOrCreateKeys(): JWTKeyStore {
    // 1. 환경변수에서 고정 키 확인
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) {
      logger.info('Using JWT secret from environment variable');
      return {
        current: {
          version: 1,
          secret: process.env.JWT_SECRET,
          createdAt: new Date(),
        }
      };
    }

    // 2. 기존 키 파일 로드 시도
    try {
      if (fs.existsSync(this.keyFilePath)) {
        const data = fs.readFileSync(this.keyFilePath, 'utf8');
        const keyStore = JSON.parse(data);
        keyStore.current.createdAt = new Date(keyStore.current.createdAt);
        if (keyStore.previous) {
          keyStore.previous.createdAt = new Date(keyStore.previous.createdAt);
        }
        logger.info('Loaded existing JWT keys from file');
        return keyStore;
      }
    } catch (error) {
      logger.error('Error loading JWT keys:', error);
      // 백업 파일 시도
      try {
        if (fs.existsSync(this.backupPath)) {
          fs.copyFileSync(this.backupPath, this.keyFilePath);
          return this.loadOrCreateKeys(); // 재귀 호출
        }
      } catch (backupError) {
        logger.error('Error loading backup JWT keys:', backupError);
      }
    }

    // 3. 기존 .jwt-secret 파일 마이그레이션
    const oldSecretFile = path.join(__dirname, '../../.jwt-secret');
    try {
      if (fs.existsSync(oldSecretFile)) {
        const oldSecret = fs.readFileSync(oldSecretFile, 'utf8').trim();
        if (oldSecret) {
          logger.info('Migrating from old JWT secret file');
          const keyStore: JWTKeyStore = {
            current: {
              version: 1,
              secret: oldSecret,
              createdAt: new Date(),
            }
          };
          this.saveKeys(keyStore);
          // 이전 파일은 백업으로 이름 변경
          fs.renameSync(oldSecretFile, oldSecretFile + '.old');
          return keyStore;
        }
      }
    } catch (error) {
      logger.error('Error migrating old JWT secret:', error);
    }

    // 4. 새 키 생성
    logger.info('Generating new JWT key');
    const newKeyStore: JWTKeyStore = {
      current: {
        version: 1,
        secret: crypto.randomBytes(64).toString('base64'),
        createdAt: new Date(),
      }
    };
    this.saveKeys(newKeyStore);
    return newKeyStore;
  }

  private saveKeys(keyStore: JWTKeyStore): void {
    try {
      // 백업 생성
      if (fs.existsSync(this.keyFilePath)) {
        fs.copyFileSync(this.keyFilePath, this.backupPath);
      }
      
      // 새 키 저장
      fs.writeFileSync(
        this.keyFilePath,
        JSON.stringify(keyStore, null, 2),
        { mode: 0o600 } // 읽기 권한을 소유자만으로 제한
      );
      
      logger.info('JWT keys saved successfully');
    } catch (error) {
      logger.error('Error saving JWT keys:', error);
      throw new Error('Failed to save JWT keys');
    }
  }

  public getCurrentSecret(): string {
    return this.keyStore.current.secret;
  }

  public getPreviousSecret(): string | undefined {
    return this.keyStore.previous?.secret;
  }

  public rotateKey(): void {
    const newKey: JWTKeyVersion = {
      version: this.keyStore.current.version + 1,
      secret: crypto.randomBytes(64).toString('base64'),
      createdAt: new Date(),
    };

    this.keyStore = {
      current: newKey,
      previous: this.keyStore.current,
    };

    this.saveKeys(this.keyStore);
    logger.info('JWT key rotated successfully');
  }

  public getKeyAge(): number {
    return Date.now() - this.keyStore.current.createdAt.getTime();
  }

  public shouldRotate(): boolean {
    // 30일마다 키 로테이션 권장
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return this.getKeyAge() > thirtyDays;
  }
}

// 싱글톤 인스턴스
const keyManager = new JWTKeyManager();

// 키 로테이션 체크 (프로덕션 환경에서만)
if (process.env.NODE_ENV === 'production' && keyManager.shouldRotate()) {
  logger.warn('JWT key is older than 30 days. Consider rotating.');
}

export const jwtConfig = {
  secret: keyManager.getCurrentSecret(),
  previousSecret: keyManager.getPreviousSecret(),
  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '30d',
  issuer: 'mathematical-economics',
  audience: 'mathematical-economics-users',
};

export const accessTokenOptions: SignOptions = {
  expiresIn: jwtConfig.accessTokenExpiry as any,
  algorithm: 'HS256',
  issuer: jwtConfig.issuer,
  audience: jwtConfig.audience,
};

export const refreshTokenOptions: SignOptions = {
  expiresIn: jwtConfig.refreshTokenExpiry as any,
  algorithm: 'HS256',
  issuer: jwtConfig.issuer,
  audience: jwtConfig.audience,
};

export { keyManager };