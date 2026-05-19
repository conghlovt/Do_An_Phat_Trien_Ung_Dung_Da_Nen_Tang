import type { NextFunction, Request, Response } from 'express';
export interface CustomerAuthUser {
    id: string;
    role: string;
    [key: string]: unknown;
}
export interface CustomerAuthRequest extends Request {
    user?: CustomerAuthUser;
}
export declare const authenticateCustomer: (req: CustomerAuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requireCustomer: (req: CustomerAuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const customerOnly: readonly [(req: CustomerAuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined, (req: CustomerAuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined];
export declare const forceCustomerRole: (req: Request, _res: Response, next: NextFunction) => void;
export declare const ensureCustomerAccountByEmail: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const ensureCustomerRefreshToken: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.middleware.d.ts.map