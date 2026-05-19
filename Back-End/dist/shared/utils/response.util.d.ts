import type { Response } from 'express';
import { type FieldErrors } from './app-error.util';
export type ApiMeta = {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    sortBy?: string;
};
export type ApiSuccess<T = unknown> = {
    success: true;
    message: string;
    data: T;
    meta?: ApiMeta;
};
export type ApiError = {
    success: false;
    message: string;
    errors?: FieldErrors;
};
export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;
export declare const sendResponse: <T>(res: Response, httpStatus: number, message: string, data?: T, options?: {
    meta?: ApiMeta;
    errors?: FieldErrors;
}) => Response<any, Record<string, any>>;
export declare const sendError: (res: Response, error: unknown) => Response<any, Record<string, any>>;
export interface ValidationError {
    field: string;
    message: string;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface ResponseMeta {
    pagination?: PaginationMeta;
    filters?: Record<string, any>;
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}
export interface PartnerApiResponse<T = any> {
    status: 'success' | 'fail' | 'error';
    code: string;
    message: string;
    data: T | null;
    errors?: ValidationError[];
    meta?: ResponseMeta;
    timestamp: string;
}
export declare const sendSuccess: <T>(res: Response, httpCode: number, appCode: string, message: string, data?: T | null, meta?: ResponseMeta) => void;
export declare const sendPartnerError: (res: Response, httpCode: number, appCode: string, message: string, errors?: ValidationError[]) => void;
export declare const buildPaginationMeta: (page: number, limit: number, totalItems: number) => PaginationMeta;
//# sourceMappingURL=response.util.d.ts.map