// ============================================================
// Auth Service — Business logic for authentication
// Replaces direct Prisma calls from old auth controller
// ============================================================

import prisma from '../../login/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../shared/utils/jwt.util';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from '../../shared/errors/AppError';

export class AuthService {

  /**
   * Register a new user
   */
  async register(data: { email: string; password: string; username: string; role: string }) {
    const { email, password, username, role } = data;

    // Check existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictError('Email đã được sử dụng', 'AUTH_EMAIL_EXISTS');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        role: role as any,
        code: role === 'partner'
          ? 'PT' + Math.floor(Math.random() * 10000)
          : 'CUS' + Math.floor(Math.random() * 10000),
        avatar: `https://i.pravatar.cc/150?u=${email}`,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({ id: newUser.id, role: newUser.role });
    const refreshToken = generateRefreshToken({ id: newUser.id, role: newUser.role });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  /**
   * Login user
   */
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Email hoặc mật khẩu không đúng', 'AUTH_INVALID_CREDENTIALS');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Email hoặc mật khẩu không đúng', 'AUTH_INVALID_CREDENTIALS');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(token: string) {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) {
        throw new UnauthorizedError('Refresh token không hợp lệ', 'AUTH_TOKEN_INVALID');
      }

      const accessToken = generateAccessToken({ id: user.id, role: user.role });
      const newRefreshToken = generateRefreshToken({ id: user.id, role: user.role });

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedError('Refresh token không hợp lệ hoặc đã hết hạn', 'AUTH_TOKEN_INVALID');
    }
  }

  /**
   * Forgot password — generate reset code
   */
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundError('Không tìm thấy tài khoản với email này', 'USER_NOT_FOUND');
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.update({
      where: { email },
      data: { code: resetCode },
    });

    // TODO: Send email with reset code
    console.log(`🔑 Reset code for ${email}: ${resetCode}`);

    return { code: resetCode }; // In production, don't return code in response
  }

  /**
   * Reset password using code
   */
  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.code !== code) {
      throw new BadRequestError('Mã xác nhận không đúng', 'AUTH_INVALID_RESET_CODE');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, code: null },
    });

    return true;
  }
}

export const authService = new AuthService();
