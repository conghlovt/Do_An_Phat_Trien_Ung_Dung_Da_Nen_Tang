import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { sendResponse } from '../../shared/utils/response.util';

export const validate =
  (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[source] ?? {});

      if (source === 'body') {
        req.body = data;
      } else {
        Object.defineProperty(req, source, {
          value: data,
          configurable: true,
          enumerable: true,
        });
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.reduce<Record<string, string>>((acc, issue) => {
          const field = issue.path.join('.') || source;
          acc[field] = issue.message;
          return acc;
        }, {});

        return sendResponse(res, 400, 'Dữ liệu gửi lên chưa hợp lệ.', undefined, { errors });
      }

      next(error);
    }
  };
