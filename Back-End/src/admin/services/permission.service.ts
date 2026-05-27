import prisma from '../../login/lib/prisma';
import { AppError } from '../../shared/utils/app-error.util';

export const PERMISSION_MODULES = [
  'dashboard',
  'users',
  'lodging',
  'rooms',
  'booking',
  'voucher',
  'reviews',
  'content',
  'finance',
  'notifications',
  'roles',
] as const;

export const PERMISSION_ACTIONS = ['view', 'create', 'update', 'delete', 'approve', 'export'] as const;

export const ROLE_PERMISSION_ROLES = ['SUPER_ADMIN', 'admin', 'OPERATOR', 'ACCOUNTANT', 'staff', 'partner', 'customer'] as const;
export const ROOT_ADMIN_ROLES = ['SUPER_ADMIN', 'admin'] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];
export type PermissionMap = Record<PermissionModule, Record<PermissionAction, boolean>>;

const MODULE_ALIASES: Record<string, PermissionModule> = {
  revenue: 'finance',
  partners: 'users',
};

const ACTION_ALIASES: Record<string, PermissionAction> = {
  edit: 'update',
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const normalizePermissionAction = (action: string): PermissionAction | null => {
  if ((PERMISSION_ACTIONS as readonly string[]).includes(action)) return action as PermissionAction;
  return ACTION_ALIASES[action] || null;
};

export const normalizePermissionModule = (moduleId: string): PermissionModule | null => {
  if ((PERMISSION_MODULES as readonly string[]).includes(moduleId)) return moduleId as PermissionModule;
  return MODULE_ALIASES[moduleId] || null;
};

export const createPermissionMap = (enabled = false): PermissionMap =>
  PERMISSION_MODULES.reduce((modules, moduleId) => {
    modules[moduleId] = PERMISSION_ACTIONS.reduce((actions, actionId) => {
      actions[actionId] = enabled;
      return actions;
    }, {} as Record<PermissionAction, boolean>);
    return modules;
  }, {} as PermissionMap);

export const getDefaultPermissions = (role: string): PermissionMap => {
  const permissions = createPermissionMap(ROOT_ADMIN_ROLES.includes(role as any));

  if (role === 'OPERATOR') {
    for (const moduleId of ['dashboard', 'lodging', 'rooms', 'booking', 'voucher', 'reviews', 'content', 'notifications'] as PermissionModule[]) {
      permissions[moduleId].view = true;
      permissions[moduleId].update = true;
      permissions[moduleId].approve = true;
    }
  }

  if (role === 'ACCOUNTANT') {
    for (const moduleId of ['dashboard', 'booking', 'voucher', 'finance'] as PermissionModule[]) {
      permissions[moduleId].view = true;
      permissions[moduleId].export = true;
    }
    permissions.finance.update = true;
    permissions.finance.approve = true;
  }

  if (role === 'staff') {
    permissions.dashboard.view = true;
    permissions.booking.view = true;
    permissions.lodging.view = true;
  }

  return permissions;
};

export const normalizePermissions = (role: string, permissions?: unknown, strict = false): PermissionMap => {
  const next = getDefaultPermissions(role);
  if (permissions === undefined || permissions === null) return next;

  if (!isObject(permissions)) {
    throw new AppError(400, 'VALIDATION_ERROR', {
      userMessage: 'Dữ liệu phân quyền không hợp lệ.',
      errors: { permissions: 'permissions phải là object.' },
    });
  }

  for (const [rawModuleId, rawActions] of Object.entries(permissions)) {
    const moduleId = normalizePermissionModule(rawModuleId);
    if (!moduleId) {
      if (strict) {
        throw new AppError(400, 'VALIDATION_ERROR', {
          userMessage: 'Dữ liệu phân quyền không hợp lệ.',
          errors: { [rawModuleId]: 'Module quyền không được hỗ trợ.' },
        });
      }
      continue;
    }

    if (!isObject(rawActions)) {
      throw new AppError(400, 'VALIDATION_ERROR', {
        userMessage: 'Dữ liệu phân quyền không hợp lệ.',
        errors: { [rawModuleId]: 'Giá trị module phải là object.' },
      });
    }

    for (const [rawActionId, value] of Object.entries(rawActions)) {
      const actionId = normalizePermissionAction(rawActionId);
      if (!actionId) {
        if (strict) {
          throw new AppError(400, 'VALIDATION_ERROR', {
            userMessage: 'Dữ liệu phân quyền không hợp lệ.',
            errors: { [`${rawModuleId}.${rawActionId}`]: 'Hành động quyền không được hỗ trợ.' },
          });
        }
        continue;
      }

      if (typeof value !== 'boolean') {
        throw new AppError(400, 'VALIDATION_ERROR', {
          userMessage: 'Dữ liệu phân quyền không hợp lệ.',
          errors: { [`${rawModuleId}.${rawActionId}`]: 'Giá trị quyền phải là boolean.' },
        });
      }

      if (rawActionId === 'edit') {
        next[moduleId].create = value;
        next[moduleId].update = value;
      } else {
        next[moduleId][actionId] = value;
      }
    }
  }

  return next;
};

const assertSupportedRole = (role: string) => {
  if (!ROLE_PERMISSION_ROLES.includes(role as any)) {
    throw new AppError(400, 'PERMISSION_ROLE_UNSUPPORTED');
  }
};

export const permissionService = {
  getRolePermissions: async () => {
    return await Promise.all(
      ROLE_PERMISSION_ROLES.map(async (role) => {
        const saved = await prisma.rolePermission.findUnique({ where: { role: role as any } });
        if (saved) {
          return {
            ...saved,
            permissions: normalizePermissions(role, saved.permissions),
          };
        }

        return await prisma.rolePermission.create({
          data: { role: role as any, permissions: getDefaultPermissions(role) },
        });
      }),
    );
  },

  getRolePermission: async (role: string) => {
    assertSupportedRole(role);

    const saved = await prisma.rolePermission.findUnique({ where: { role: role as any } });
    if (saved) {
      return {
        ...saved,
        permissions: normalizePermissions(role, saved.permissions),
      };
    }

    return await prisma.rolePermission.create({
      data: { role: role as any, permissions: getDefaultPermissions(role) },
    });
  },

  updateRolePermissions: async (role: string, permissions: unknown) => {
    assertSupportedRole(role);
    const normalized = normalizePermissions(role, permissions, true);

    return await prisma.rolePermission.upsert({
      where: { role: role as any },
      update: { permissions: normalized },
      create: { role: role as any, permissions: normalized },
    });
  },
};
