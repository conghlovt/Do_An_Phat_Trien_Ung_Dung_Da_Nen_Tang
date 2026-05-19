import { type Request, type Response, type NextFunction } from 'express';
export interface AuthUser {
    id: string;
    role: string;
    [key: string]: any;
}
export interface AuthRequest extends Request {
    user?: AuthUser;
}
/**
 * Verify JWT Access Token from Authorization header
 */
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => void;
/**
 * Check if user has one of the required roles
 */
export declare const authorize: (roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map