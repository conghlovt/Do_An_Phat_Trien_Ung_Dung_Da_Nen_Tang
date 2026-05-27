// ============================================================
// Auth Middleware - JWT verify + role/status checks from database
// ============================================================

import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../../shared/utils/jwt.util';
import prisma from '../lib/prisma';
import { sendError, sendPartnerError } from '../../shared/utils/response.util';
import { USER_MESSAGES } from '../../shared/utils/app-error.util';
import { isActiveUserStatus, isPendingUserStatus } from '../../shared/utils/user-status.util';

export interface AuthUser {
  id: string;
  role: string;
  email?: string;
  username?: string;
  status?: string;
  [key: string]: any;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const rejectInactiveUser = (res: Response, status?: string | null) => {
  const isPending = isPendingUserStatus(status);
  return sendPartnerError(
    res,
    403,
    isPending ? 'AUTH_USER_PENDING' : 'AUTH_USER_BLOCKED',
    isPending ? USER_MESSAGES.AUTH_USER_PENDING : USER_MESSAGES.AUTH_USER_BLOCKED,
  );
};

/**
 * Verify JWT Access Token from Authorization header, then load fresh user role/status.
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');
    return sendPartnerError(res, 401, 'AUTH_TOKEN_REQUIRED', USER_MESSAGES.AUTH_TOKEN_MISSING);
  }

  try {
    const decoded = verifyAccessToken(token);
    const userId = typeof decoded?.id === 'string' ? decoded.id : undefined;

    if (!userId) {
      res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');
      return sendPartnerError(res, 401, 'AUTH_TOKEN_INVALID', USER_MESSAGES.AUTH_TOKEN_INVALID);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');
      return sendPartnerError(res, 401, 'AUTH_TOKEN_INVALID', USER_MESSAGES.AUTH_TOKEN_INVALID);
    }

    if (!isActiveUserStatus(user.status)) {
      return rejectInactiveUser(res, user.status);
    }

    req.user = {
      ...(decoded as AuthUser),
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
    };
    return next();
  } catch (error) {
    res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');

    if (error instanceof jwt.TokenExpiredError) {
      return sendPartnerError(res, 401, 'AUTH_TOKEN_EXPIRED', USER_MESSAGES.AUTH_TOKEN_EXPIRED);
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return sendPartnerError(res, 401, 'AUTH_TOKEN_INVALID', USER_MESSAGES.AUTH_TOKEN_INVALID);
    }

    return sendError(res, error);
  }
};

/**
 * Check if user has one of the required roles.
 */
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendPartnerError(res, 403, 'FORBIDDEN', USER_MESSAGES.AUTH_FORBIDDEN);
    }
    next();
  };
};
