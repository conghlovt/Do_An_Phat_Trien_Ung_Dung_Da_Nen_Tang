import { Router } from 'express';
import * as authController from './login.controller';
import { authenticate } from './middlewares/auth.middleware';
import { validate } from './middlewares/validate.middleware';
import { registerSchema, loginSchema, refreshTokenSchema, resetPasswordSchema } from './middlewares/login.validator';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);
router.post('/logout', authController.logout);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);



export default router;
