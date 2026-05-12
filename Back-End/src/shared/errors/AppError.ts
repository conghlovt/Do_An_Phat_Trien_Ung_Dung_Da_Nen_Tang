// ============================================================
// Custom Error Class Hierarchy
// Thay thế throw new Error('FORBIDDEN') → throw new ForbiddenError(...)
// Global error handler sẽ tự động catch và trả response chuẩn.
// ============================================================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly appCode: string;
  public readonly isOperational: boolean;

  constructor(statusCode: number, appCode: string, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.appCode = appCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// 400 Bad Request
export class BadRequestError extends AppError {
  constructor(message = 'Yêu cầu không hợp lệ', appCode = 'BAD_REQUEST') {
    super(400, appCode, message);
  }
}

// 401 Unauthorized
export class UnauthorizedError extends AppError {
  constructor(message = 'Chưa xác thực', appCode = 'UNAUTHORIZED') {
    super(401, appCode, message);
  }
}

// 403 Forbidden
export class ForbiddenError extends AppError {
  constructor(message = 'Không có quyền thực hiện', appCode = 'FORBIDDEN') {
    super(403, appCode, message);
  }
}

// 404 Not Found
export class NotFoundError extends AppError {
  constructor(message = 'Không tìm thấy tài nguyên', appCode = 'NOT_FOUND') {
    super(404, appCode, message);
  }
}

// 409 Conflict
export class ConflictError extends AppError {
  constructor(message = 'Dữ liệu bị trùng lặp', appCode = 'CONFLICT') {
    super(409, appCode, message);
  }
}

// 422 Unprocessable Entity
export class UnprocessableError extends AppError {
  constructor(message = 'Không thể xử lý yêu cầu', appCode = 'UNPROCESSABLE') {
    super(422, appCode, message);
  }
}
