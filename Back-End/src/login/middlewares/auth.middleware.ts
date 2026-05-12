// ============================================================
// Auth Middleware — JWT verify + role-based authorization
// ============================================================

import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../../shared/utils/jwt.util';
import { sendError, sendPartnerError } from '../../shared/utils/response.util';
import { USER_MESSAGES } from '../../shared/utils/app-error.util';

export interface AuthUser {
  id: string;
  role: string;
  [key: string]: any; // Allow extending payload fields
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

/**
 * Verify JWT Access Token from Authorization header
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');
    return sendPartnerError(res, 401, 'AUTH_TOKEN_REQUIRED', USER_MESSAGES?.AUTH_TOKEN_MISSING || 'Access token là bắt buộc');
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded as AuthUser;
    next();
  } catch (error) {
    res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');

    if (error instanceof jwt.TokenExpiredError) {
      return sendPartnerError(res, 401, 'AUTH_TOKEN_EXPIRED', USER_MESSAGES?.AUTH_TOKEN_EXPIRED || 'Access token đã hết hạn');
    }

    return sendPartnerError(res, 401, 'AUTH_TOKEN_INVALID', USER_MESSAGES?.AUTH_TOKEN_INVALID || 'Access token không hợp lệ');
  }
};

/**
 * Check if user has one of the required roles
 */
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendPartnerError(res, 403, 'FORBIDDEN', USER_MESSAGES?.AUTH_FORBIDDEN || 'Bạn không có quyền thực hiện thao tác này');
    }
    next();
  };
};