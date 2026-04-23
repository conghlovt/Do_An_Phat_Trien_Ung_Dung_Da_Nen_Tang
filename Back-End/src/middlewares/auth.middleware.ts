import { type Request, type Response, type NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { sendResponse } from '../utils/response.util';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendResponse(res, 401, 'Access token is required');
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return sendResponse(res, 403, 'Invalid or expired access token');
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendResponse(res, 403, 'You do not have permission to perform this action');
    }
    next();
  };
};
