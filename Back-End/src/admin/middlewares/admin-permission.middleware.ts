import type { NextFunction, Response } from 'express';
import prisma from '../../login/lib/prisma';
import { sendError, sendResponse } from '../../shared/utils/response.util';
import { USER_MESSAGES } from '../../shared/utils/app-error.util';
import type { AuthRequest } from '../../login/middlewares/auth.middleware';
import {
  normalizePermissionAction,
  normalizePermissionModule,
  normalizePermissions,
  ROOT_ADMIN_ROLES,
  type PermissionAction,
  type PermissionModule,
} from '../services/permission.service';

type GuardAction = PermissionAction | 'edit';
type GuardModule = PermissionModule | 'revenue' | 'partners';

const CONFIG_ROLES = ['SUPER_ADMIN', 'admin', 'OPERATOR', 'ACCOUNTANT', 'staff'];

export const requireRootAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const role = req.user?.role;
  if (role === 'SUPER_ADMIN') return next();

  if (role === 'admin') {
    try {
      const superAdminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' as any } });
      if (superAdminCount === 0) return next();
    } catch (error) {
      return sendError(res, error);
    }
  }

  return sendResponse(res, 403, USER_MESSAGES.ADMIN_PERMISSION_REQUIRED, undefined, { code: 'ADMIN_PERMISSION_REQUIRED' });
};

export const permissionGuard = (
  modules: GuardModule | GuardModule[],
  actions: GuardAction | GuardAction[],
) => async (req: AuthRequest, res: Response, next: NextFunction) => {
  const role = req.user?.role;
  if (!role) {
    res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');
    return sendResponse(res, 401, USER_MESSAGES.AUTH_TOKEN_MISSING, undefined, { code: 'AUTH_TOKEN_MISSING' });
  }

  if (ROOT_ADMIN_ROLES.includes(role as any)) {
    return next();
  }

  if (!CONFIG_ROLES.includes(role)) {
    return sendResponse(res, 403, USER_MESSAGES.AUTH_FORBIDDEN, undefined, { code: 'AUTH_FORBIDDEN' });
  }

  const moduleList = (Array.isArray(modules) ? modules : [modules])
    .map((moduleId) => normalizePermissionModule(moduleId))
    .filter(Boolean) as PermissionModule[];
  const actionList = (Array.isArray(actions) ? actions : [actions])
    .map((actionId) => normalizePermissionAction(actionId))
    .filter(Boolean) as PermissionAction[];

  if (!moduleList.length || !actionList.length) {
    return sendResponse(res, 403, USER_MESSAGES.AUTH_FORBIDDEN, undefined, { code: 'AUTH_FORBIDDEN' });
  }

  try {
    const saved = await prisma.rolePermission.findUnique({ where: { role: role as any } });
    const permissions = normalizePermissions(role, saved?.permissions);
    const allowed = moduleList.some((moduleId) => actionList.some((actionId) => permissions[moduleId]?.[actionId]));

    if (!allowed) {
      return sendResponse(res, 403, USER_MESSAGES.AUTH_FORBIDDEN, undefined, { code: 'AUTH_FORBIDDEN' });
    }

    return next();
  } catch (error) {
    return sendError(res, error);
  }
};
