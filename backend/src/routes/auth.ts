import { Router } from 'express';
import { authRateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validation';
import { authValidators } from '../utils/validators';
import * as authController from '../controllers/authController';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  authValidators.register,
  validate,
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  authValidators.login,
  validate,
  authController.login
);

router.post('/logout', authController.logout);

router.post('/refresh', authController.refreshToken);

export default router;