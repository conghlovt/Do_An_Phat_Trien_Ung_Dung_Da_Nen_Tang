import { type Request, type Response, type NextFunction } from 'express';
import { type ZodSchema } from 'zod';
/**
 * Validate request body/query/params using a Zod schema.
 * Usage: validate(schema, 'body') or validate(schema, 'query')
 *
 * NOTE: Express 5 makes req.query and req.params read-only getters.
 * We must use Object.defineProperty to override them with parsed data.
 */
export declare const validate: (schema: ZodSchema, source?: "body" | "query" | "params") => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.middleware.d.ts.map