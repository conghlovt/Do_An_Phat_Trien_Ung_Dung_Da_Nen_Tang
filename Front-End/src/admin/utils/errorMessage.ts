import { getApiErrorMessage } from '../../login/shared/api/api-error.util';

export const getErrorMessage = (error: unknown, fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.') => {
  return getApiErrorMessage(error, fallback);
};
