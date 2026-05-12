import type { Response } from 'express';
import { toAppError, type FieldErrors } from './app-error.util'; // Nhớ copy app-error.util.ts vào cùng thư mục

// ============================================================
// ADMIN RESPONSE LOGIC
// ============================================================
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

export const sendResponse = <T>(
  res: Response,
  httpStatus: number,
  message: string,
  data?: T,
  options: { meta?: ApiMeta; errors?: FieldErrors } = {},
) => {
  const success = httpStatus >= 200 && httpStatus < 300;

  if (success) {
    const response: ApiSuccess<T | null> = {
      success: true,
      message,
      data: data ?? null,
      ...(options.meta ? { meta: options.meta } : {}),
    };
    return res.status(httpStatus).json(response);
  }

  const response: ApiError = {
    success: false,
    message,
    ...(options.errors ? { errors: options.errors } : {}),
  };
  return res.status(httpStatus).json(response);
};

export const sendError = (res: Response, error: unknown) => {
  const appError = toAppError(error);

  console.error('API error', {
    internalCode: appError.internalCode,
    rawMessage: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    details: appError.details,
    status: appError.httpStatus,
  });

  return sendResponse(
    res,
    appError.httpStatus,
    appError.userMessage,
    undefined,
    appError.errors ? { errors: appError.errors } : {},
  );
};

// ============================================================
// PARTNER RESPONSE LOGIC
// ============================================================
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
  sort?: { field: string; order: 'asc' | 'desc' };
}

// Đổi tên để không trùng với ApiResponse của Admin
export interface PartnerApiResponse<T = any> {
  status: 'success' | 'fail' | 'error';
  code: string;
  message: string;
  data: T | null;
  errors?: ValidationError[];
  meta?: ResponseMeta;
  timestamp: string;
}

export const sendSuccess = <T>(
  res: Response,
  httpCode: number,
  appCode: string,
  message: string,
  data: T | null = null,
  meta?: ResponseMeta
): void => {
  // 1. Khởi tạo với các trường bắt buộc, ép kiểu as const để TS hiểu chính xác
  const resData: PartnerApiResponse<T> = {
    status: 'success' as const,
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

export const sendPartnerError = (
  res: Response,
  httpCode: number,
  appCode: string,
  message: string,
  errors?: ValidationError[]
): void => {
  // 1. Khởi tạo với các trường bắt buộc
  const resData: PartnerApiResponse<null> = {
    status: (httpCode >= 500 ? 'error' : 'fail') as 'error' | 'fail',
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

export const buildPaginationMeta = (
  page: number,
  limit: number,
  totalItems: number
): PaginationMeta => {
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