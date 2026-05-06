import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../utils/jwt.util';
import { sendResponse } from '../utils/response.util';
import { USER_MESSAGES } from '../utils/app-error.util';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');
    return sendResponse(res, 401, USER_MESSAGES.AUTH_TOKEN_MISSING);
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');

    if (error instanceof jwt.TokenExpiredError) {
      return sendResponse(res, 401, USER_MESSAGES.AUTH_TOKEN_EXPIRED);
    }

    return sendResponse(res, 401, USER_MESSAGES.AUTH_TOKEN_INVALID);
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendResponse(res, 403, USER_MESSAGES.AUTH_FORBIDDEN);
    }
    next();
  };
};
