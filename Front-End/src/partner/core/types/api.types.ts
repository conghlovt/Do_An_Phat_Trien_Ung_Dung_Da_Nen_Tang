// ============================================================
// Standardized API Response Types — khớp backend format
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
}

export interface ApiResponse<T = any> {
  status: 'success' | 'fail' | 'error';
  code: string;
  message: string;
  data: T;
  errors?: ValidationError[];
  meta?: ResponseMeta;
  timestamp: string;
}
