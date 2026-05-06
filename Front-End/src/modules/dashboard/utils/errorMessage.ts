const ERROR_MESSAGES: Record<string, string> = {
  'Access token is required': 'Vui lòng đăng nhập để tiếp tục.',
  'Invalid or expired access token': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  'You do not have permission to perform this action': 'Bạn không có quyền thực hiện thao tác này.',
  'Only Super Admin can configure admin permissions': 'Chỉ Super Admin mới được cấu hình phân quyền.',
  'Only Super Admin can create admin or staff accounts': 'Chỉ Super Admin mới được tạo tài khoản admin hoặc nhân viên.',
  'Only Super Admin can update admin or staff accounts': 'Chỉ Super Admin mới được cập nhật tài khoản admin hoặc nhân viên.',
  'Only Super Admin can delete admin or staff accounts': 'Chỉ Super Admin mới được xóa tài khoản admin hoặc nhân viên.',
  'User not found': 'Không tìm thấy người dùng.',
  'Email already exists': 'Email đã tồn tại.',
  'Missing required user fields': 'Vui lòng nhập đầy đủ thông tin người dùng.',
  'Missing required voucher fields': 'Vui lòng nhập đầy đủ thông tin voucher.',
  'Unsupported permission role': 'Vai trò phân quyền không được hỗ trợ.',
  'Permissions payload is required': 'Thiếu dữ liệu cấu hình phân quyền.',
};

export const getErrorMessage = (error: any, fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.') => {
  const message = error?.response?.data?.message || error?.message;
  if (!message) return fallback;

  return ERROR_MESSAGES[message] || message || fallback;
};
