export declare const USER_MESSAGES: {
    readonly AUTH_TOKEN_MISSING: "Bạn chưa đăng nhập.";
    readonly AUTH_TOKEN_INVALID: "Thông tin xác thực không hợp lệ.";
    readonly AUTH_TOKEN_EXPIRED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    readonly AUTH_FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.";
    readonly AUTH_INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng.";
    readonly AUTH_REGISTER_ROLE_INVALID: "Vai trò đăng ký không hợp lệ.";
    readonly AUTH_REQUIRED_FIELDS: "Vui lòng nhập đầy đủ thông tin.";
    readonly AUTH_EMAIL_PASSWORD_REQUIRED: "Vui lòng nhập email và mật khẩu.";
    readonly AUTH_REFRESH_TOKEN_MISSING: "Thiếu refresh token.";
    readonly AUTH_REFRESH_TOKEN_INVALID: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.";
    readonly AUTH_EMAIL_REQUIRED: "Vui lòng nhập email.";
    readonly AUTH_RESET_FIELDS_REQUIRED: "Vui lòng nhập email, mã xác nhận và mật khẩu mới.";
    readonly AUTH_RESET_CODE_INVALID: "Email hoặc mã xác nhận không hợp lệ.";
    readonly VALIDATION_ERROR: "Dữ liệu gửi lên chưa hợp lệ.";
    readonly RESOURCE_NOT_FOUND: "Không tìm thấy dữ liệu yêu cầu.";
    readonly INTERNAL_ERROR: "Hệ thống đang bận. Vui lòng thử lại sau.";
    readonly FORGOT_PASSWORD_ACCEPTED: "Nếu email tồn tại, hệ thống đã gửi hướng dẫn đặt lại mật khẩu.";
    readonly EMAIL_EXISTS: "Email đã tồn tại.";
    readonly USER_EXISTS: "Tài khoản đã tồn tại.";
    readonly USER_NOT_FOUND: "Không tìm thấy người dùng.";
    readonly ADMIN_PERMISSION_REQUIRED: "Chỉ Super Admin mới được cấu hình phân quyền.";
    readonly ADMIN_ACCOUNT_FORBIDDEN: "Bạn không có quyền quản lý tài khoản quản trị hoặc nhân viên.";
    readonly PERMISSION_ROLE_UNSUPPORTED: "Vai trò phân quyền không được hỗ trợ.";
    readonly PERMISSION_PAYLOAD_REQUIRED: "Thiếu dữ liệu cấu hình phân quyền.";
    readonly VOUCHER_REQUIRED_FIELDS: "Vui lòng nhập đầy đủ thông tin voucher.";
    readonly CONTENT_REQUIRED_FIELDS: "Vui lòng nhập đầy đủ thông tin bài viết.";
    readonly AUTH_USER_PENDING: "Tài khoản của bạn đang chờ phê duyệt. Vui lòng quay lại sau.";
    readonly AUTH_USER_BLOCKED: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.";
};
export type InternalCode = keyof typeof USER_MESSAGES;
export type FieldErrors = Record<string, string>;
type AppErrorOptions = {
    userMessage?: string;
    details?: unknown;
    errors?: FieldErrors;
    cause?: unknown;
};
export declare class AppError extends Error {
    readonly httpStatus: number;
    readonly internalCode: InternalCode;
    readonly userMessage: string;
    readonly details?: unknown;
    readonly errors?: FieldErrors;
    constructor(httpStatus: number, internalCode: InternalCode, options?: AppErrorOptions);
}
export declare const isAppError: (error: unknown) => error is AppError;
export declare const toAppError: (error: unknown) => AppError;
export {};
//# sourceMappingURL=app-error.util.d.ts.map