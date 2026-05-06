import axios from 'axios';
import { type ApiError } from '../types/api.types';

export const DEFAULT_API_ERROR_MESSAGE = 'Đã xảy ra lỗi. Vui lòng thử lại.';
export const NETWORK_ERROR_MESSAGE = 'Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.';

export const getApiErrorMessage = (error: unknown, fallback = DEFAULT_API_ERROR_MESSAGE) => {
  if (axios.isAxiosError<ApiError>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) return message;

    if (!error.response) return NETWORK_ERROR_MESSAGE;
    return fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
