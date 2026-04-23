import { type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util';
import { sendResponse } from '../utils/response.util';

export const register = async (req: Request, res: Response) => {
  const { email, password, username, role } = req.body;

  if (!email || !password || !username || !role) {
    return sendResponse(res, 400, 'All fields are required');
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return sendResponse(res, 400, 'User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        role: role as any,
        code: role === 'partner' ? 'PT' + Math.floor(Math.random() * 100) : 'CUS' + Math.floor(Math.random() * 100),
        avatar: `https://i.pravatar.cc/150?u=${email}`,
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    const accessToken = generateAccessToken({ id: newUser.id, role: newUser.role });
    const refreshToken = generateRefreshToken({ id: newUser.id, role: newUser.role });

    return sendResponse(res, 201, 'User registered successfully', {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return sendResponse(res, 500, 'Internal server error');
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendResponse(res, 400, 'Email and password are required');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return sendResponse(res, 401, 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendResponse(res, 401, 'Invalid email or password');
    }

    const { password: _, ...userWithoutPassword } = user;
    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

    return sendResponse(res, 200, 'Login successful', {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return sendResponse(res, 500, 'Internal server error', { debug: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return sendResponse(res, 400, 'Refresh token is required');
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return sendResponse(res, 401, 'Invalid refresh token');
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    return sendResponse(res, 200, 'Token refreshed successfully', { accessToken });
  } catch (error) {
    return sendResponse(res, 401, 'Invalid or expired refresh token');
  }
};

export const logout = async (req: Request, res: Response) => {
  // For JWT, logout is mostly handled by the client (deleting tokens)
  return sendResponse(res, 200, 'Logged out successfully');
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return sendResponse(res, 400, 'Email is required');
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendResponse(res, 404, 'User not found');
    }

    // Generate a 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update user with reset code
    await prisma.user.update({
      where: { email },
      data: { code: resetCode },
    });

    // In a real app, send email here. For now, we'll return it in the response for testing.
    console.log(`Reset code for ${email}: ${resetCode}`);

    return sendResponse(res, 200, 'Reset code sent to email', { code: resetCode });
  } catch (error) {
    return sendResponse(res, 500, 'Internal server error');
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return sendResponse(res, 400, 'All fields are required');
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.code !== code) {
      return sendResponse(res, 400, 'Invalid code or email');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        code: null // Clear the code after successful reset
      },
    });

    return sendResponse(res, 200, 'Password reset successfully');
  } catch (error) {
    return sendResponse(res, 500, 'Internal server error');
  }
};
