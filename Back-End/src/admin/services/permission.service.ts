import prisma from '../../login/lib/prisma';
import { AppError } from '../../login/utils/app-error.util';

const PERMISSION_MODULES = ['revenue', 'booking', 'lodging', 'users', 'partners', 'finance', 'voucher', 'reviews', 'content'];
const PERMISSION_ACTIONS = ['view', 'edit', 'delete', 'approve'];
const ROOT_ADMIN_ROLES = ['SUPER_ADMIN', 'admin'];
const ROLE_PERMISSION_ROLES = ['SUPER_ADMIN', 'OPERATOR', 'ACCOUNTANT'] as const;

const getDefaultPermissions = (role: string) => {
  const permissions: Record<string, Record<string, boolean>> = {};

  for (const moduleId of PERMISSION_MODULES) {
    permissions[moduleId] = {};
    for (const actionId of PERMISSION_ACTIONS) {
      permissions[moduleId]![actionId] = ROOT_ADMIN_ROLES.includes(role);
    }
  }

  if (role === 'OPERATOR') {
    for (const moduleId of ['booking', 'lodging', 'partners', 'voucher', 'reviews', 'content']) {
      permissions[moduleId]!.view = true;
      permissions[moduleId]!.edit = true;
      permissions[moduleId]!.approve = true;
    }
  }

  if (role === 'ACCOUNTANT') {
    for (const moduleId of ['revenue', 'finance', 'booking', 'voucher']) {
      permissions[moduleId]!.view = true;
    }
    permissions.finance!.edit = true;
    permissions.finance!.approve = true;
  }

  return permissions;
};

export const permissionService = {
  getRolePermissions: async () => {
    return await Promise.all(
      ROLE_PERMISSION_ROLES.map(async (role) => {
        return await prisma.rolePermission.upsert({
          where: { role },
          update: {},
          create: { role, permissions: getDefaultPermissions(role) },
        });
      }),
    );
  },

  updateRolePermissions: async (role: string, permissions: any) => {
    if (!ROLE_PERMISSION_ROLES.includes(role as any)) {
      throw new AppError(400, 'PERMISSION_ROLE_UNSUPPORTED');
    }

    return await prisma.rolePermission.upsert({
      where: { role: role as any },
      update: { permissions },
      create: { role: role as any, permissions },
    });
  },
};
