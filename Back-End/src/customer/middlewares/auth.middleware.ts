import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../login/lib/prisma';
import { verifyAccessToken } from '../../shared/utils/jwt.util';
import { sendResponse } from '../../shared/utils/response.util';
import { USER_MESSAGES } from '../../shared/utils/app-error.util';

export interface CustomerAuthUser {
  id: string;
  role: string;
  [key: string]: unknown;
}

export interface CustomerAuthRequest extends Request {
  user?: CustomerAuthUser;
}

export const authenticateCustomer = async (
  req: CustomerAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');
    return sendResponse(res, 401, USER_MESSAGES.AUTH_TOKEN_MISSING);
  }

  let decoded: CustomerAuthUser;

  try {
    decoded = verifyAccessToken(token) as CustomerAuthUser;
  } catch (error) {
    res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');

    if (error instanceof jwt.TokenExpiredError) {
      return sendResponse(res, 401, USER_MESSAGES.AUTH_TOKEN_EXPIRED);
    }

    return sendResponse(res, 401, USER_MESSAGES.AUTH_TOKEN_INVALID);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, status: true },
    });

    if (!user) {
      res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');
      return sendResponse(res, 401, USER_MESSAGES.AUTH_TOKEN_INVALID);
    }

    if (user.status === 'BLOCKED' || user.status === 'banned') {
      return sendResponse(res, 403, USER_MESSAGES.AUTH_USER_BLOCKED);
    }

    if (user.status === 'PENDING') {
      return sendResponse(res, 403, USER_MESSAGES.AUTH_USER_PENDING);
    }

    req.user = { ...decoded, id: user.id, role: user.role };
    next();
  } catch (error) {
    next(error);
  }
};

export const requireCustomer = (
  req: CustomerAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== 'customer') {
    return sendResponse(res, 403, USER_MESSAGES.AUTH_FORBIDDEN);
  }

  next();
};

export const customerOnly = [authenticateCustomer, requireCustomer] as const;

export const forceCustomerRole = (req: Request, _res: Response, next: NextFunction) => {
  req.body = { ...req.body, role: 'customer' };
  next();
};

export const ensureCustomerAccountByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) return next();

    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });

    if (user && user.role !== 'customer') {
      return sendResponse(res, 403, USER_MESSAGES.AUTH_FORBIDDEN);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const ensureCustomerRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = String(req.body?.refreshToken || '').trim();
    if (!refreshToken) return next();

    const user = await prisma.user.findFirst({
      where: { refreshToken },
      select: { role: true },
    });

    if (user && user.role !== 'customer') {
      return sendResponse(res, 403, USER_MESSAGES.AUTH_FORBIDDEN);
    }

    next();
  } catch (error) {
    next(error);
  }
};
