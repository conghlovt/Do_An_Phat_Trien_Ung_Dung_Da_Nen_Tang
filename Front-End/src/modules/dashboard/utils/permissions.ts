export type PermissionAction = 'view' | 'edit' | 'delete' | 'approve';
export type PermissionModule =
  | 'revenue'
  | 'booking'
  | 'lodging'
  | 'users'
  | 'partners'
  | 'finance'
  | 'voucher'
  | 'reviews'
  | 'content';

export type PermissionMap = Record<PermissionModule, Record<PermissionAction, boolean>>;

export interface ModuleAccess {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
}

export const PERMISSION_MODULES: PermissionModule[] = [
  'revenue',
  'booking',
  'lodging',
  'users',
  'partners',
  'finance',
  'voucher',
  'reviews',
  'content',
];

export const PERMISSION_ACTIONS: PermissionAction[] = ['view', 'edit', 'delete', 'approve'];

export const ADMIN_CONFIG_ROLES = ['SUPER_ADMIN', 'OPERATOR', 'ACCOUNTANT'];
export const ROOT_ADMIN_ROLES = ['SUPER_ADMIN', 'admin'];

export const createPermissionMap = (enabled = false): PermissionMap =>
  PERMISSION_MODULES.reduce((modules, moduleId) => {
    modules[moduleId] = PERMISSION_ACTIONS.reduce((actions, actionId) => {
      actions[actionId] = enabled;
      return actions;
    }, {} as Record<PermissionAction, boolean>);
    return modules;
  }, {} as PermissionMap);

export const getDefaultPermissions = (role?: string): PermissionMap => {
  const permissions = createPermissionMap(role === 'SUPER_ADMIN' || role === 'admin');

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

export const normalizePermissions = (role?: string, permissions?: Partial<PermissionMap> | null): PermissionMap => {
  const fallback = getDefaultPermissions(role);
  const next = createPermissionMap(false);

  for (const moduleId of PERMISSION_MODULES) {
    for (const actionId of PERMISSION_ACTIONS) {
      next[moduleId][actionId] = Boolean(permissions?.[moduleId]?.[actionId] ?? fallback[moduleId][actionId]);
    }
  }

  return next;
};

export const canAccess = (
  permissions: PermissionMap,
  moduleId: PermissionModule,
  action: PermissionAction = 'view',
) => Boolean(permissions[moduleId]?.[action]);

export const getModuleForTab = (tab: string): PermissionModule | 'overview' | 'roles' => {
  if (tab === 'overview') return 'overview';
  if (tab === 'booking') return 'booking';
  if (tab === 'lodging') return 'lodging';
  if (tab === 'voucher') return 'voucher';
  if (tab === 'reviews') return 'reviews';
  if (tab === 'content') return 'content';
  if (tab === 'revenue' || tab === 'payment' || tab === 'finance') return 'finance';
  if (tab === 'partners') return 'partners';
  if (['users', 'customers', 'staff', 'admins'].includes(tab)) return 'users';
  if (tab === 'roles') return 'roles';
  return 'overview';
};

export const canViewTab = (permissions: PermissionMap, role: string | undefined, tab: string) => {
  if (['roles', 'admins', 'staff'].includes(tab)) {
    return ROOT_ADMIN_ROLES.includes(role || '');
  }

  const moduleId = getModuleForTab(tab);
  if (moduleId === 'overview') return true;
  if (moduleId === 'roles') return ROOT_ADMIN_ROLES.includes(role || '');
  return canAccess(permissions, moduleId, 'view');
};
