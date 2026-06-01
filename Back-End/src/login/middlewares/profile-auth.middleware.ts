// src/customer/middlewares/profile-auth.middleware.ts

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../../shared/utils/jwt.util';
import { sendPartnerError } from '../../shared/utils/response.util';
import { USER_MESSAGES } from '../../shared/utils/app-error.util';

export interface ProfileAuthUser {
  id: string;
  role: string;
  [key: string]: any;
}

export interface ProfileAuthRequest extends Request {
  user?: ProfileAuthUser;
}

export const authenticateProfile = (
  req: ProfileAuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');
    return sendPartnerError(
      res,
      401,
      'AUTH_TOKEN_REQUIRED',
      USER_MESSAGES?.AUTH_TOKEN_MISSING || 'Access token là bắt buộc'
    );
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded as ProfileAuthUser;
    next();
  } catch (error) {
    res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');

    if (error instanceof jwt.TokenExpiredError) {
      return sendPartnerError(
        res,
        401,
        'AUTH_TOKEN_EXPIRED',
        USER_MESSAGES?.AUTH_TOKEN_EXPIRED || 'Access token đã hết hạn'
      );
    }

    return sendPartnerError(
      res,
      401,
      'AUTH_TOKEN_INVALID',
      USER_MESSAGES?.AUTH_TOKEN_INVALID || 'Access token không hợp lệ'
    );
  }
};