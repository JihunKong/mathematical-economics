import { Router } from 'express';
import { authRateLimiter } from '../middleware/rateLimiter';
import { loginRateLimiter } from '../middleware/security';
import { validate } from '../middleware/validation';
import { authValidators } from '../utils/validators';
import * as authController from '../controllers/authController';

const router = Router();

router.post(
  '/register'에러가 발생했습니다'/login'에러가 발생했습니다'/logout', authController.logout);

router.post('/refresh', authController.refreshToken);

export default router;