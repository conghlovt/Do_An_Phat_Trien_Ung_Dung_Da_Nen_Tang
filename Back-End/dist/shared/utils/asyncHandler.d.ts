import type { Request, Response, NextFunction, RequestHandler } from 'express';
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => RequestHandler;
//# sourceMappingURL=asyncHandler.d.ts.map