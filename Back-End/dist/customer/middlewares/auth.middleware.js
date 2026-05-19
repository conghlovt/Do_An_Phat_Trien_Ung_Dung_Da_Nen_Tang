import jwt from 'jsonwebtoken';
import prisma from '../../login/lib/prisma';
import { verifyAccessToken } from '../../shared/utils/jwt.util';
import { sendResponse } from '../../shared/utils/response.util';
import { USER_MESSAGES } from '../../shared/utils/app-error.util';
export const authenticateCustomer = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');
        return sendResponse(res, 401, USER_MESSAGES.AUTH_TOKEN_MISSING);
    }
    try {
        req.user = verifyAccessToken(token);
        next();
    }
    catch (error) {
        res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');
        if (error instanceof jwt.TokenExpiredError) {
            return sendResponse(res, 401, USER_MESSAGES.AUTH_TOKEN_EXPIRED);
        }
        return sendResponse(res, 401, USER_MESSAGES.AUTH_TOKEN_INVALID);
    }
};
export const requireCustomer = (req, res, next) => {
    if (req.user?.role !== 'customer') {
        return sendResponse(res, 403, USER_MESSAGES.AUTH_FORBIDDEN);
    }
    next();
};
export const customerOnly = [authenticateCustomer, requireCustomer];
export const forceCustomerRole = (req, _res, next) => {
    req.body = { ...req.body, role: 'customer' };
    next();
};
export const ensureCustomerAccountByEmail = async (req, res, next) => {
    try {
        const email = String(req.body?.email || '').trim().toLowerCase();
        if (!email)
            return next();
        const user = await prisma.user.findUnique({
            where: { email },
            select: { role: true },
        });
        if (user && user.role !== 'customer') {
            return sendResponse(res, 403, USER_MESSAGES.AUTH_FORBIDDEN);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
export const ensureCustomerRefreshToken = async (req, res, next) => {
    try {
        const refreshToken = String(req.body?.refreshToken || '').trim();
        if (!refreshToken)
            return next();
        const user = await prisma.user.findFirst({
            where: { refreshToken },
            select: { role: true },
        });
        if (user && user.role !== 'customer') {
            return sendResponse(res, 403, USER_MESSAGES.AUTH_FORBIDDEN);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=auth.middleware.js.map