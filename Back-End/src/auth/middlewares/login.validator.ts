import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  username: z.string().min(2, 'Tên người dùng phải có ít nhất 2 ký tự').max(100),
  role: z.enum(['customer', 'partner'], {
    message: 'Vai trò là bắt buộc (customer hoặc partner)',
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token là bắt buộc'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  code: z.string().min(1, 'Mã xác nhận là bắt buộc'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
});
