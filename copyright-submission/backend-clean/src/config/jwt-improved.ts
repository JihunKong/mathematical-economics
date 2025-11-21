import { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger'에러가 발생했습니다'../../.jwt-keys.json');
    this.backupPath = path.join(__dirname, '../../.jwt-keys.backup.json'에러가 발생했습니다'Using JWT secret from environment variable'에러가 발생했습니다'utf8'에러가 발생했습니다'Loaded existing JWT keys from file');
        return keyStore;
      }
    } catch (error) {
      logger.error('Error loading JWT keys:'에러가 발생했습니다'Error loading backup JWT keys:'에러가 발생했습니다'../../.jwt-secret'에러가 발생했습니다'utf8').trim();
        if (oldSecret) {
          logger.info('Migrating from old JWT secret file'에러가 발생했습니다'.old');
          return keyStore;
        }
      }
    } catch (error) {
      logger.error('Error migrating old JWT secret:', error);
    }

    // 4. 새 키 생성
    logger.info('Generating new JWT key'에러가 발생했습니다'base64'에러가 발생했습니다'JWT keys saved successfully');
    } catch (error) {
      logger.error('Error saving JWT keys:', error);
      throw new Error('Failed to save JWT keys'에러가 발생했습니다'base64'에러가 발생했습니다'JWT key rotated successfully'에러가 발생했습니다'production' && keyManager.shouldRotate()) {
  logger.warn('JWT key is older than 30 days. Consider rotating.'에러가 발생했습니다'15m',
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '30d',
  issuer: 'mathematical-economics',
  audience: 'mathematical-economics-users'에러가 발생했습니다'HS256'에러가 발생했습니다'HS256',
  issuer: jwtConfig.issuer,
  audience: jwtConfig.audience,
};

export { keyManager };