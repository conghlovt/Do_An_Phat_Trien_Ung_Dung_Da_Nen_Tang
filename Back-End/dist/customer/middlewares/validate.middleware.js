import { ZodError } from 'zod';
import { sendResponse } from '../../shared/utils/response.util';
export const validate = (schema, source = 'body') => (req, res, next) => {
    try {
        const data = schema.parse(req[source] ?? {});
        if (source === 'body') {
            req.body = data;
        }
        else {
            Object.defineProperty(req, source, {
                value: data,
                configurable: true,
                enumerable: true,
            });
        }
        next();
    }
    catch (error) {
        if (error instanceof ZodError) {
            const errors = error.issues.reduce((acc, issue) => {
                const field = issue.path.join('.') || source;
                acc[field] = issue.message;
                return acc;
            }, {});
            return sendResponse(res, 400, 'Dữ liệu gửi lên chưa hợp lệ.', undefined, { errors });
        }
        next(error);
    }
};
//# sourceMappingURL=validate.middleware.js.map