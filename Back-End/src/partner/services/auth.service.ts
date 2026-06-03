import prisma from '../../login/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../shared/utils/jwt.util';
import { isActiveUserStatus, isPendingUserStatus } from '../../shared/utils/user-status.util';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from '../../shared/errors/AppError';

export class AuthService {
  private assertUserCanAuthenticate(user: { status: string }) {
    if (isActiveUserStatus(user.status)) return;

    if (isPendingUserStatus(user.status)) {
      throw new UnauthorizedError('Tài khoản của bạn đang chờ phê duyệt. Vui lòng quay lại sau.', 'AUTH_USER_PENDING');
    }

    throw new UnauthorizedError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.', 'AUTH_USER_BLOCKED');
  }

  async register(data: { email: string; password: string; username: string; role: string }) {
    const { email, password, username, role } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictError('Email đã được sử dụng', 'AUTH_EMAIL_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
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

    const accessToken = generateAccessToken({ id: newUser.id, role: newUser.role });
    const refreshToken = generateRefreshToken({ id: newUser.id, role: newUser.role });

    await prisma.user.update({
      where: { id: newUser.id },
      data: { refreshToken },
    });

    const { password: _, refreshToken: __, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Email hoặc mật khẩu không đúng', 'AUTH_INVALID_CREDENTIALS');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Email hoặc mật khẩu không đúng', 'AUTH_INVALID_CREDENTIALS');
    }

    this.assertUserCanAuthenticate(user);

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), refreshToken },
    });

    const { password: _, refreshToken: __, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  async refreshToken(token: string) {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user || user.refreshToken !== token) {
        throw new UnauthorizedError('Refresh token không hợp lệ', 'AUTH_TOKEN_INVALID');
      }

      try {
        this.assertUserCanAuthenticate(user);
      } catch (error) {
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: null },
        });
        throw error;
      }

      const accessToken = generateAccessToken({ id: user.id, role: user.role });
      const newRefreshToken = generateRefreshToken({ id: user.id, role: user.role });

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken },
      });

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      if (error instanceof UnauthorizedError && ['AUTH_USER_PENDING', 'AUTH_USER_BLOCKED'].includes(error.appCode)) {
        throw error;
      }

      throw new UnauthorizedError('Refresh token không hợp lệ hoặc đã hết hạn', 'AUTH_TOKEN_INVALID');
    }
  }

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

    console.log(`Reset code for ${email}: ${resetCode}`);
    return { code: resetCode };
  }

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
