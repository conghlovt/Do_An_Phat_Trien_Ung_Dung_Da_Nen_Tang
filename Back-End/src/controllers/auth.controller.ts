import { type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util';
import { sendError, sendResponse } from '../utils/response.util';
import { USER_MESSAGES } from '../utils/app-error.util';

export const register = async (req: Request, res: Response) => {
  const { email, password, username, role } = req.body;

  if (!email || !password || !username || !role) {
    return sendResponse(res, 400, USER_MESSAGES.AUTH_REQUIRED_FIELDS);
  }

  if (!['customer', 'partner'].includes(role)) {
    return sendResponse(res, 400, USER_MESSAGES.AUTH_REGISTER_ROLE_INVALID);
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return sendResponse(res, 409, USER_MESSAGES.USER_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        role: role as any,
        status: role === 'partner' ? 'PENDING' : 'ACTIVE',
        code: role === 'partner' ? 'PT' + Math.floor(Math.random() * 100) : 'CUS' + Math.floor(Math.random() * 100),
        avatar: `https://i.pravatar.cc/150?u=${email}`,
      },
    });

    const finalAccessToken = generateAccessToken({ id: newUser.id, role: newUser.role });
    const finalRefreshToken = generateRefreshToken({ id: newUser.id, role: newUser.role });

    await prisma.user.update({
      where: { id: newUser.id },
      data: { refreshToken: finalRefreshToken },
    });

    const { password: _, refreshToken: __, ...userWithoutPassword } = newUser;

    return sendResponse(res, 201, 'Đăng ký thành công.', {
      user: userWithoutPassword,
      accessToken: finalAccessToken,
      refreshToken: finalRefreshToken,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendResponse(res, 400, USER_MESSAGES.AUTH_EMAIL_PASSWORD_REQUIRED);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return sendResponse(res, 401, USER_MESSAGES.AUTH_INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendResponse(res, 401, USER_MESSAGES.AUTH_INVALID_CREDENTIALS);
    }

    if (user.status === 'BLOCKED') {
      return sendResponse(res, 403, USER_MESSAGES.AUTH_USER_BLOCKED);
    }

    if (user.status === 'PENDING') {
      return sendResponse(res, 403, USER_MESSAGES.AUTH_USER_PENDING);
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const { password: _, refreshToken: __, ...userWithoutPassword } = user;

    return sendResponse(res, 200, 'Đăng nhập thành công.', {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return sendResponse(res, 400, USER_MESSAGES.AUTH_REFRESH_TOKEN_MISSING);
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return sendResponse(res, 401, USER_MESSAGES.AUTH_REFRESH_TOKEN_INVALID);
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    return sendResponse(res, 200, 'Làm mới phiên đăng nhập thành công.', { accessToken });
  } catch (error) {
    return sendResponse(res, 401, USER_MESSAGES.AUTH_REFRESH_TOKEN_INVALID);
  }
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    try {
      await prisma.user.updateMany({
        where: { refreshToken },
        data: { refreshToken: null },
      });
    } catch (error) {
      // Ignore errors if token doesn't exist
    }
  }
  return sendResponse(res, 200, 'Đăng xuất thành công.');
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return sendResponse(res, 400, USER_MESSAGES.AUTH_EMAIL_REQUIRED);
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return sendResponse(res, 404, USER_MESSAGES.USER_NOT_FOUND);
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.update({
      where: { email },
      data: { code: resetCode },
    });

    console.log(`Reset code for ${email}: ${resetCode}`);

    return sendResponse(res, 200, 'Mã xác nhận đã được gửi đến email của bạn.');
  } catch (error) {
    return sendError(res, error);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return sendResponse(res, 400, USER_MESSAGES.AUTH_RESET_FIELDS_REQUIRED);
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.code !== code) {
      return sendResponse(res, 400, USER_MESSAGES.AUTH_RESET_CODE_INVALID);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        code: null // Clear the code after successful reset
      },
    });

    return sendResponse(res, 200, 'Đặt lại mật khẩu thành công.');
  } catch (error) {
    return sendError(res, error);
  }
};
