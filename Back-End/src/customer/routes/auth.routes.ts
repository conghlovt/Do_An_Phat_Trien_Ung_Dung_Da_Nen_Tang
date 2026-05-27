import { Router } from 'express';
import * as authController from '../../login/login.controller';
import {
  customerLoginSchema,
  customerRegisterSchema,
  forgotPasswordSchema,
  logoutSchema,
  refreshTokenSchema,
  resetPasswordSchema,
} from '../middlewares/customer.validator';
import {
  ensureCustomerAccountByEmail,
  ensureCustomerRefreshToken,
  authenticateCustomer,
  forceCustomerRole,
  requireCustomer,
} from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.post('/register', validate(customerRegisterSchema), forceCustomerRole, authController.register);
router.post('/login', validate(customerLoginSchema), ensureCustomerAccountByEmail, authController.login);
router.get('/me', authenticateCustomer, requireCustomer, authController.me);
router.post('/refresh-token', validate(refreshTokenSchema), ensureCustomerRefreshToken, authController.refreshToken);
router.post('/logout', validate(logoutSchema), ensureCustomerRefreshToken, authController.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

export default router;
