import type { Response } from 'express';
import { toAppError, type FieldErrors } from './app-error.util';

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

/**
 * Standardized API Response helper
 * @param res Express Response object
 * @param httpStatus HTTP Status Code
 * @param message Response Message
 * @param data Response Data (optional)
 */
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
