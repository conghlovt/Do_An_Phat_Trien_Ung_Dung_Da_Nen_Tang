import type { NextFunction, Request, Response } from 'express';
import { type ZodSchema } from 'zod';
export declare const validate: (schema: ZodSchema, source?: "body" | "query" | "params") => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=validate.middleware.d.ts.map