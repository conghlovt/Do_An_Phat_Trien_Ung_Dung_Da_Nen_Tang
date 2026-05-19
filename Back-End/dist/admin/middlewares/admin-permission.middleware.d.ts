import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '../../login/middlewares/auth.middleware';
type PermissionAction = 'view' | 'edit' | 'delete' | 'approve';
type PermissionModule = 'revenue' | 'booking' | 'lodging' | 'users' | 'partners' | 'finance' | 'voucher' | 'reviews' | 'content';
export declare const requireRootAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const permissionGuard: (modules: PermissionModule | PermissionModule[], actions: PermissionAction | PermissionAction[]) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=admin-permission.middleware.d.ts.map