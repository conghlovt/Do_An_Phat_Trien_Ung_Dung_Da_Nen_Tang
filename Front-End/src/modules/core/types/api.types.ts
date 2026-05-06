export type ApiMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  sortBy?: string;
};

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
  meta?: ApiMeta;
};

export type ApiError = {
  success: false;
  message: string;
  errors?: Record<string, string>;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
