// ============================================================
// Global Error Handler Middleware
// Catches AppError subclasses + Prisma errors + generic errors
// ============================================================

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { sendError, sendPartnerError } from '../../shared/utils/response.util';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 1. Custom AppError — business logic errors
  if (err instanceof AppError) {
    sendPartnerError(res, err.statusCode, err.appCode, err.message);
    return;
  }

  // 2. Zod Validation errors (fallback)
  if (err.name === 'ZodError') {
    const zodErr = err as any;
    const errors = (zodErr.errors || []).map((e: any) => ({
      field: (e.path || []).join('.'),
      message: e.message || 'Validation error',
    }));
    sendPartnerError(res, 400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', errors);
    return;
  }

  // 3. Prisma known errors (supports Prisma v7 + adapter-pg)
  if (isPrismaError(err)) {
    handlePrismaError(err, res);
    return;
  }

  // 4. Multer errors (file upload)
  if (err.name === 'MulterError') {
    const multerErr = err as any;
    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      sendPartnerError(res, 400, 'FILE_TOO_LARGE', 'File quá lớn');
      return;
    }
    if (multerErr.code === 'LIMIT_UNEXPECTED_FILE') {
      sendPartnerError(res, 400, 'FILE_FIELD_INVALID', 'Tên field upload không đúng');
      return;
    }
    sendPartnerError(res, 400, 'FILE_UPLOAD_ERROR', multerErr.message);
    return;
  }

  // 5. Unknown errors — log full detail for debugging
  console.error('❌ Unhandled Error:', err.name, err.message);
  console.error('   Stack:', err.stack);
  sendPartnerError(res, 500, 'INTERNAL_ERROR', 'Lỗi hệ thống, vui lòng thử lại sau');
};

function isPrismaError(err: any): boolean {
  // Prisma v7 errors: PrismaClientKnownRequestError, PrismaClientValidationError, etc.
  const prismaErrorNames = [
    'PrismaClientKnownRequestError',
    'PrismaClientUnknownRequestError',
    'PrismaClientValidationError',
    'PrismaClientInitializationError',
    'PrismaClientRustPanicError',
  ];
  if (prismaErrorNames.includes(err.constructor?.name || err.name)) return true;
  // Fallback: error code starts with 'P' (Prisma convention)
  if (err.code && typeof err.code === 'string' && err.code.startsWith('P')) return true;
  return false;
}

function handlePrismaError(err: any, res: Response): void {
  // Log full error for debugging
  console.error('🔴 Prisma Error:', {
    name: err.constructor?.name || err.name,
    code: err.code,
    message: err.message,
    meta: err.meta,
  });

  // Validation error — usually wrong data type or missing fields
  if (err.constructor?.name === 'PrismaClientValidationError' || err.name === 'PrismaClientValidationError') {
    sendPartnerError(res, 400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ cho cơ sở dữ liệu');
    return;
  }

  switch (err.code) {
    case 'P2002': {
      const fields = err.meta?.target?.join(', ') || 'unknown';
      sendPartnerError(res, 409, 'DUPLICATE_ENTRY', `Giá trị đã tồn tại: ${fields}`);
      return;
    }
    case 'P2025':
      sendPartnerError(res, 404, 'NOT_FOUND', 'Không tìm thấy bản ghi');
      return;
    case 'P2003':
      sendPartnerError(res, 400, 'INVALID_REFERENCE', 'Tham chiếu không hợp lệ');
      return;
    default:
      sendPartnerError(res, 500, 'DATABASE_ERROR', 'Lỗi cơ sở dữ liệu');
  }
}

