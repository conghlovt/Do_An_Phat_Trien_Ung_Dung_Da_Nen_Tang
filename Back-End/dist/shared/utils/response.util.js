import { toAppError } from './app-error.util'; // Nhớ copy app-error.util.ts vào cùng thư mục
export const sendResponse = (res, httpStatus, message, data, options = {}) => {
    const success = httpStatus >= 200 && httpStatus < 300;
    if (success) {
        const response = {
            success: true,
            message,
            data: data ?? null,
            ...(options.meta ? { meta: options.meta } : {}),
        };
        return res.status(httpStatus).json(response);
    }
    const response = {
        success: false,
        message,
        ...(options.errors ? { errors: options.errors } : {}),
    };
    return res.status(httpStatus).json(response);
};
export const sendError = (res, error) => {
    const appError = toAppError(error);
    console.error('API error', {
        internalCode: appError.internalCode,
        rawMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        details: appError.details,
        status: appError.httpStatus,
    });
    return sendResponse(res, appError.httpStatus, appError.userMessage, undefined, appError.errors ? { errors: appError.errors } : {});
};
export const sendSuccess = (res, httpCode, appCode, message, data = null, meta) => {
    // 1. Khởi tạo với các trường bắt buộc, ép kiểu as const để TS hiểu chính xác
    const resData = {
        status: 'success',
        code: appCode,
        message,
        data,
        timestamp: new Date().toISOString(),
    };
    // 2. Chỉ thêm trường tuỳ chọn nếu có giá trị
    if (meta) {
        resData.meta = meta;
    }
    res.status(httpCode).json(resData);
};
export const sendPartnerError = (res, httpCode, appCode, message, errors) => {
    // 1. Khởi tạo với các trường bắt buộc
    const resData = {
        status: (httpCode >= 500 ? 'error' : 'fail'),
        code: appCode,
        message,
        data: null,
        timestamp: new Date().toISOString(),
    };
    // 2. Chỉ thêm trường tuỳ chọn nếu có giá trị
    if (errors) {
        resData.errors = errors;
    }
    res.status(httpCode).json(resData);
};
export const buildPaginationMeta = (page, limit, totalItems) => {
    const totalPages = Math.ceil(totalItems / limit);
    return {
        page,
        limit,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
};
//# sourceMappingURL=response.util.js.map