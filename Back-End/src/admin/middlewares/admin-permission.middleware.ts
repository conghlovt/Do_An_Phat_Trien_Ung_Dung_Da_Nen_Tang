import type { NextFunction, Response } from 'express';
import prisma from '../../login/lib/prisma';
import { sendError, sendResponse } from '../../shared/utils/response.util';
import { USER_MESSAGES } from '../../shared/utils/app-error.util';
import type { AuthRequest } from '../../login/middlewares/auth.middleware';

type PermissionAction = 'view' | 'edit' | 'delete' | 'approve';
type PermissionModule = 'revenue' | 'booking' | 'lodging' | 'users' | 'partners' | 'finance' | 'voucher' | 'reviews' | 'content';

const ROOT_ADMIN_ROLES = ['SUPER_ADMIN', 'admin'];
const CONFIG_ROLES = ['SUPER_ADMIN', 'OPERATOR', 'ACCOUNTANT'];
const PERMISSION_MODULES: PermissionModule[] = ['revenue', 'booking', 'lodging', 'users', 'partners', 'finance', 'voucher', 'reviews', 'content'];
const PERMISSION_ACTIONS: PermissionAction[] = ['view', 'edit', 'delete', 'approve'];

const createPermissionMap = (enabled = false) =>
  PERMISSION_MODULES.reduce((modules, moduleId) => {
    modules[moduleId] = PERMISSION_ACTIONS.reduce((actions, actionId) => {
      actions[actionId] = enabled;
      return actions;
    }, {} as Record<PermissionAction, boolean>);
    return modules;
  }, {} as Record<PermissionModule, Record<PermissionAction, boolean>>);

const getDefaultPermissions = (role: string) => {
  const permissions = createPermissionMap(ROOT_ADMIN_ROLES.includes(role));

  if (role === 'OPERATOR') {
    for (const moduleId of ['booking', 'lodging', 'partners', 'voucher', 'reviews', 'content'] as PermissionModule[]) {
      permissions[moduleId].view = true;
      permissions[moduleId].edit = true;
      permissions[moduleId].approve = true;
    }
  }

  if (role === 'ACCOUNTANT') {
    for (const moduleId of ['revenue', 'finance', 'booking', 'voucher'] as PermissionModule[]) {
      permissions[moduleId].view = true;
    }
    permissions.finance.edit = true;
    permissions.finance.approve = true;
  }

  return permissions;
};

const normalizePermissions = (role: string, savedPermissions: any) => {
  const fallback = getDefaultPermissions(role);
  const next = createPermissionMap(false);

  for (const moduleId of PERMISSION_MODULES) {
    for (const actionId of PERMISSION_ACTIONS) {
      next[moduleId][actionId] = Boolean(savedPermissions?.[moduleId]?.[actionId] ?? fallback[moduleId][actionId]);
    }
  }

  return next;
};

export const requireRootAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!ROOT_ADMIN_ROLES.includes(req.user?.role)) {
    return sendResponse(res, 403, USER_MESSAGES.ADMIN_PERMISSION_REQUIRED);
  }

  return next();
};

export const permissionGuard = (
  modules: PermissionModule | PermissionModule[],
  actions: PermissionAction | PermissionAction[],
) => async (req: AuthRequest, res: Response, next: NextFunction) => {
  const role = req.user?.role;
  if (!role) {
    res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"');
    return sendResponse(res, 401, USER_MESSAGES.AUTH_TOKEN_MISSING);
  }

  if (ROOT_ADMIN_ROLES.includes(role)) {
    return next();
  }

  if (!CONFIG_ROLES.includes(role)) {
    return sendResponse(res, 403, USER_MESSAGES.AUTH_FORBIDDEN);
  }

  const moduleList = Array.isArray(modules) ? modules : [modules];
  const actionList = Array.isArray(actions) ? actions : [actions];

  try {
    const saved = await prisma.rolePermission.findUnique({ where: { role: role as any } });
    const permissions = normalizePermissions(role, saved?.permissions);
    const allowed = moduleList.some((moduleId) => actionList.some((actionId) => permissions[moduleId]?.[actionId]));

    if (!allowed) {
      return sendResponse(res, 403, USER_MESSAGES.AUTH_FORBIDDEN);
    }

    return next();
  } catch (error) {
    return sendError(res, error);
  }
};
