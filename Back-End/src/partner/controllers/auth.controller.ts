import type { Request, Response } from 'express';
import prisma from '../../login/lib/prisma';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../../shared/utils/response.util';

export class AuthController {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    sendSuccess(res, 201, 'AUTH_REGISTER_SUCCESS', 'Đăng ký tài khoản thành công', result);
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendSuccess(res, 200, 'AUTH_LOGIN_SUCCESS', 'Đăng nhập thành công', result);
  }

  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    sendSuccess(res, 200, 'AUTH_REFRESH_SUCCESS', 'Làm mới token thành công', result);
  }

  async me(req: Request, res: Response) {
    sendSuccess(res, 200, 'AUTH_ME_SUCCESS', 'Lấy thông tin phiên đăng nhập thành công', {
      user: (req as any).user,
    });
  }

  async logout(req: Request, res: Response) {
    const { refreshToken } = req.body || {};
    if (refreshToken) {
      await prisma.user.updateMany({
        where: { refreshToken },
        data: { refreshToken: null },
      });
    }

    sendSuccess(res, 200, 'AUTH_LOGOUT_SUCCESS', 'Đăng xuất thành công');
  }

  async forgotPassword(req: Request, res: Response) {
    const result = await authService.forgotPassword(req.body.email);
    sendSuccess(res, 200, 'AUTH_RESET_CODE_SENT', 'Đã gửi mã xác nhận đến email', result);
  }

  async resetPassword(req: Request, res: Response) {
    const { email, code, newPassword } = req.body;
    await authService.resetPassword(email, code, newPassword);
    sendSuccess(res, 200, 'AUTH_PASSWORD_RESET_SUCCESS', 'Đặt lại mật khẩu thành công');
  }
}

export const authController = new AuthController();
