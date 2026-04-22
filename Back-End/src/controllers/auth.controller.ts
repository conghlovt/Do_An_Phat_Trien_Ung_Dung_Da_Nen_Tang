import { type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util';

export const register = async (req: Request, res: Response) => {
  const { email, password, username, role } = req.body;

  if (!email || !password || !username || !role) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
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

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      debug: error.message // Thêm dòng này để xem lỗi ở Frontend
    });
  }
};


export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required',
    });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    res.status(200).json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
    });
  }
};



export const logout = async (req: Request, res: Response) => {
  // For JWT, logout is mostly handled by the client (deleting tokens)
  // Here we just return success
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
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

    res.status(200).json({
      success: true,
      message: 'Reset code sent to email',
      // For demo purposes, we return the code
      data: { code: resetCode } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.code !== code) {
      return res.status(400).json({ success: false, message: 'Invalid code or email' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        code: null // Clear the code after successful reset
      },
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


