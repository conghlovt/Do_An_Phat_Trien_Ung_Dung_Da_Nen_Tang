// ============================================================
// Validate Middleware — Zod schema validation for req body/query/params
// ============================================================
import {} from 'express';
import { ZodError } from 'zod';
import { sendError, sendPartnerError } from '../../shared/utils/response.util';
/**
 * Validate request body/query/params using a Zod schema.
 * Usage: validate(schema, 'body') or validate(schema, 'query')
 *
 * NOTE: Express 5 makes req.query and req.params read-only getters.
 * We must use Object.defineProperty to override them with parsed data.
 */
export const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const data = schema.parse(req[source]);
            if (source === 'body') {
                req.body = data;
            }
            else {
                // Use Object.defineProperty to overwrite the getter
                Object.defineProperty(req, source, {
                    value: data,
                    configurable: true,
                    enumerable: true
                });
            }
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                return sendPartnerError(res, 400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', errors);
            }
            next(error);
        }
    };
};
//# sourceMappingURL=validate.middleware.js.map