// ============================================================
// Auth Controller — Thin layer: parse request → call service → send response
// No try/catch needed — asyncHandler + errorHandler middleware handles errors
// ============================================================
import { authService } from '../services/auth.service';
import { sendSuccess } from '../../shared/utils/response.util';
export class AuthController {
    /** POST /api/v1/auth/register */
    async register(req, res) {
        const result = await authService.register(req.body);
        sendSuccess(res, 201, 'AUTH_REGISTER_SUCCESS', 'Đăng ký tài khoản thành công', result);
    }
    /** POST /api/v1/auth/login */
    async login(req, res) {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        sendSuccess(res, 200, 'AUTH_LOGIN_SUCCESS', 'Đăng nhập thành công', result);
    }
    /** POST /api/v1/auth/refresh-token */
    async refreshToken(req, res) {
        const { refreshToken } = req.body;
        const result = await authService.refreshToken(refreshToken);
        sendSuccess(res, 200, 'AUTH_REFRESH_SUCCESS', 'Làm mới token thành công', result);
    }
    /** POST /api/v1/auth/logout */
    async logout(_req, res) {
        sendSuccess(res, 200, 'AUTH_LOGOUT_SUCCESS', 'Đăng xuất thành công');
    }
    /** POST /api/v1/auth/forgot-password */
    async forgotPassword(req, res) {
        const result = await authService.forgotPassword(req.body.email);
        sendSuccess(res, 200, 'AUTH_RESET_CODE_SENT', 'Đã gửi mã xác nhận đến email', result);
    }
    /** POST /api/v1/auth/reset-password */
    async resetPassword(req, res) {
        const { email, code, newPassword } = req.body;
        await authService.resetPassword(email, code, newPassword);
        sendSuccess(res, 200, 'AUTH_PASSWORD_RESET_SUCCESS', 'Đặt lại mật khẩu thành công');
    }
}
export const authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map