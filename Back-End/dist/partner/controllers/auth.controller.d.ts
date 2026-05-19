import type { Request, Response } from 'express';
export declare class AuthController {
    /** POST /api/v1/auth/register */
    register(req: Request, res: Response): Promise<void>;
    /** POST /api/v1/auth/login */
    login(req: Request, res: Response): Promise<void>;
    /** POST /api/v1/auth/refresh-token */
    refreshToken(req: Request, res: Response): Promise<void>;
    /** POST /api/v1/auth/logout */
    logout(_req: Request, res: Response): Promise<void>;
    /** POST /api/v1/auth/forgot-password */
    forgotPassword(req: Request, res: Response): Promise<void>;
    /** POST /api/v1/auth/reset-password */
    resetPassword(req: Request, res: Response): Promise<void>;
}
export declare const authController: AuthController;
//# sourceMappingURL=auth.controller.d.ts.map