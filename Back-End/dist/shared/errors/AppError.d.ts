export declare class AppError extends Error {
    readonly statusCode: number;
    readonly appCode: string;
    readonly isOperational: boolean;
    constructor(statusCode: number, appCode: string, message: string, isOperational?: boolean);
}
export declare class BadRequestError extends AppError {
    constructor(message?: string, appCode?: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string, appCode?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string, appCode?: string);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string, appCode?: string);
}
export declare class ConflictError extends AppError {
    constructor(message?: string, appCode?: string);
}
export declare class UnprocessableError extends AppError {
    constructor(message?: string, appCode?: string);
}
//# sourceMappingURL=AppError.d.ts.map