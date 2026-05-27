export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'approve' | 'export';
export type LegacyPermissionAction = PermissionAction | 'edit';
export type PermissionModule =
  | 'dashboard'
  | 'users'
  | 'lodging'
  | 'rooms'
  | 'booking'
  | 'voucher'
  | 'reviews'
  | 'content'
  | 'finance'
  | 'notifications'
  | 'roles';

export type PermissionMap = Record<PermissionModule, Record<PermissionAction, boolean>>;

export interface ModuleAccess {
  canView: boolean;
  canCreate?: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport?: boolean;
}

export const PERMISSION_MODULES: PermissionModule[] = [
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
];

export const PERMISSION_ACTIONS: PermissionAction[] = ['view', 'create', 'update', 'delete', 'approve', 'export'];

export const ADMIN_CONFIG_ROLES = ['SUPER_ADMIN', 'admin', 'OPERATOR', 'ACCOUNTANT', 'staff', 'partner', 'customer'];
export const ROOT_ADMIN_ROLES = ['SUPER_ADMIN', 'admin'];

const MODULE_ALIASES: Record<string, PermissionModule> = {
  revenue: 'finance',
  payment: 'finance',
  partners: 'users',
  admins: 'users',
  staff: 'users',
  customers: 'users',
};

const ACTION_ALIASES: Record<string, PermissionAction> = {
  edit: 'update',
};

export const normalizePermissionAction = (action: string): PermissionAction | null => {
  if ((PERMISSION_ACTIONS as string[]).includes(action)) return action as PermissionAction;
  return ACTION_ALIASES[action] || null;
};

export const normalizePermissionModule = (moduleId: string): PermissionModule | null => {
  if ((PERMISSION_MODULES as string[]).includes(moduleId)) return moduleId as PermissionModule;
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

export const getDefaultPermissions = (role?: string): PermissionMap => {
  const permissions = createPermissionMap(role === 'SUPER_ADMIN' || role === 'admin');

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

export const normalizePermissions = (role?: string, permissions?: Partial<PermissionMap> | Record<string, any> | null): PermissionMap => {
  const next = getDefaultPermissions(role);
  if (!permissions || typeof permissions !== 'object') return next;

  Object.entries(permissions).forEach(([rawModuleId, rawActions]) => {
    const moduleId = normalizePermissionModule(rawModuleId);
    if (!moduleId || !rawActions || typeof rawActions !== 'object') return;

    Object.entries(rawActions as Record<string, unknown>).forEach(([rawActionId, value]) => {
      const actionId = normalizePermissionAction(rawActionId);
      if (!actionId) return;
      if (rawActionId === 'edit') {
        next[moduleId].create = Boolean(value);
        next[moduleId].update = Boolean(value);
        return;
      }
      next[moduleId][actionId] = Boolean(value);
    });
  });

  return next;
};

export const canAccess = (
  permissions: PermissionMap,
  moduleId: PermissionModule,
  action: LegacyPermissionAction = 'view',
) => {
  const normalizedAction = normalizePermissionAction(action);
  return Boolean(normalizedAction && permissions[moduleId]?.[normalizedAction]);
};

export const getModuleForTab = (tab: string): PermissionModule | 'roles' => {
  if (tab === 'overview') return 'dashboard';
  if (tab === 'roles') return 'roles';

  const moduleId = normalizePermissionModule(tab);
  return moduleId || 'dashboard';
};

export const canViewTab = (permissions: PermissionMap, role: string | undefined, tab: string) => {
  const moduleId = getModuleForTab(tab);
  
  // Hardcoded restriction for sensitive tabs under 'users' module
  if (['admins', 'staff'].includes(tab)) {
    return ROOT_ADMIN_ROLES.includes(role || '');
  }

  return canAccess(permissions, moduleId as PermissionModule, 'view');
};
