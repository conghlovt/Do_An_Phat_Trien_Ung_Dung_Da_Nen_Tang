import { type Request, type Response, type NextFunction } from 'express';
import { type ZodSchema, ZodError } from 'zod';
import { sendPartnerError } from '../../shared/utils/response.util';

export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[source]);

      if (source === 'body') {
        req.body = data;
      } else {
        Object.defineProperty(req, source, {
          value: data,
          configurable: true,
          enumerable: true
        });
      }

      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return sendPartnerError(res, 400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', errors);
      }
      next(error);
    }
  };
};
