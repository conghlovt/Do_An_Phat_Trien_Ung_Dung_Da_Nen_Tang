// ============================================================
// Auth Routes — /api/v1/auth
// ============================================================

import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../../login/middlewares/validate.middleware';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../middlewares/auth.validator';

const router = Router();

/** POST /api/v1/auth/register */
router.post('/register',
  validate(registerSchema),
  asyncHandler((req, res) => authController.register(req, res))
);

/** POST /api/v1/auth/login */
router.post('/login',
  validate(loginSchema),
  asyncHandler((req, res) => authController.login(req, res))
);

/** POST /api/v1/auth/refresh-token */
router.post('/refresh-token',
  validate(refreshTokenSchema),
  asyncHandler((req, res) => authController.refreshToken(req, res))
);

/** POST /api/v1/auth/logout */
router.post('/logout',
  asyncHandler((req, res) => authController.logout(req, res))
);

/** POST /api/v1/auth/forgot-password */
router.post('/forgot-password',
  validate(forgotPasswordSchema),
  asyncHandler((req, res) => authController.forgotPassword(req, res))
);

/** POST /api/v1/auth/reset-password */
router.post('/reset-password',
  validate(resetPasswordSchema),
  asyncHandler((req, res) => authController.resetPassword(req, res))
);

export const authRoutes = router;
