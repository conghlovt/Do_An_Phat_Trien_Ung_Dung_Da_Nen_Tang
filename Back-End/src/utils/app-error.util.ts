export const USER_MESSAGES = {
  AUTH_TOKEN_MISSING: 'Bạn chưa đăng nhập.',
  AUTH_TOKEN_INVALID: 'Thông tin xác thực không hợp lệ.',
  AUTH_TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  AUTH_FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  AUTH_INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  AUTH_REGISTER_ROLE_INVALID: 'Vai trò đăng ký không hợp lệ.',
  AUTH_REQUIRED_FIELDS: 'Vui lòng nhập đầy đủ thông tin.',
  AUTH_EMAIL_PASSWORD_REQUIRED: 'Vui lòng nhập email và mật khẩu.',
  AUTH_REFRESH_TOKEN_MISSING: 'Thiếu refresh token.',
  AUTH_REFRESH_TOKEN_INVALID: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
  AUTH_EMAIL_REQUIRED: 'Vui lòng nhập email.',
  AUTH_RESET_FIELDS_REQUIRED: 'Vui lòng nhập email, mã xác nhận và mật khẩu mới.',
  AUTH_RESET_CODE_INVALID: 'Email hoặc mã xác nhận không hợp lệ.',
  VALIDATION_ERROR: 'Dữ liệu gửi lên chưa hợp lệ.',
  RESOURCE_NOT_FOUND: 'Không tìm thấy dữ liệu yêu cầu.',
  INTERNAL_ERROR: 'Hệ thống đang bận. Vui lòng thử lại sau.',
  FORGOT_PASSWORD_ACCEPTED: 'Nếu email tồn tại, hệ thống đã gửi hướng dẫn đặt lại mật khẩu.',
  EMAIL_EXISTS: 'Email đã tồn tại.',
  USER_EXISTS: 'Tài khoản đã tồn tại.',
  USER_NOT_FOUND: 'Không tìm thấy người dùng.',
  ADMIN_PERMISSION_REQUIRED: 'Chỉ Super Admin mới được cấu hình phân quyền.',
  ADMIN_ACCOUNT_FORBIDDEN: 'Bạn không có quyền quản lý tài khoản quản trị hoặc nhân viên.',
  PERMISSION_ROLE_UNSUPPORTED: 'Vai trò phân quyền không được hỗ trợ.',
  PERMISSION_PAYLOAD_REQUIRED: 'Thiếu dữ liệu cấu hình phân quyền.',
  VOUCHER_REQUIRED_FIELDS: 'Vui lòng nhập đầy đủ thông tin voucher.',
  CONTENT_REQUIRED_FIELDS: 'Vui lòng nhập đầy đủ thông tin bài viết.',
  AUTH_USER_PENDING: 'Tài khoản của bạn đang chờ phê duyệt. Vui lòng quay lại sau.',
  AUTH_USER_BLOCKED: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
} as const;

export type InternalCode = keyof typeof USER_MESSAGES;
export type FieldErrors = Record<string, string>;

type AppErrorOptions = {
  userMessage?: string;
  details?: unknown;
  errors?: FieldErrors;
  cause?: unknown;
};

export class AppError extends Error {
  readonly httpStatus: number;
  readonly internalCode: InternalCode;
  readonly userMessage: string;
  readonly details?: unknown;
  readonly errors?: FieldErrors;

  constructor(httpStatus: number, internalCode: InternalCode, options: AppErrorOptions = {}) {
    super(options.userMessage || USER_MESSAGES[internalCode], { cause: options.cause });
    this.name = 'AppError';
    this.httpStatus = httpStatus;
    this.internalCode = internalCode;
    this.userMessage = options.userMessage || USER_MESSAGES[internalCode];
    this.details = options.details;
    if (options.errors) {
      this.errors = options.errors;
    }
  }
}

export const isAppError = (error: unknown): error is AppError => error instanceof AppError;

export const toAppError = (error: unknown) => {
  if (isAppError(error)) return error;

  return new AppError(500, 'INTERNAL_ERROR', {
    details: error instanceof Error ? error.message : error,
    cause: error,
  });
};
