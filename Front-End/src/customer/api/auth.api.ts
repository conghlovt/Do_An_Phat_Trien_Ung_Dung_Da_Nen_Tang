import apiInstance from './api.instance';
import { type ApiResponse } from '../types/api.types';
import { type AuthResponse } from '../types/auth.types';

// Sửa lại BASE để khớp với app.use('/api/v1/customer', customerRoutes) trong app.ts
const BASE = '/api/v1/customer/auth'; 

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  // URL sẽ là: /api/v1/customer/auth/login
  const res = await apiInstance.post<ApiResponse<AuthResponse>>(`${BASE}/login`, { email, password });
  return res.data.data;
};

export const register = async (data: {
  email: string;
  password: string;
  username: string;
  role: 'customer'; // Fix cứng role là customer cho an toàn
}): Promise<AuthResponse> => {
  // URL sẽ là: /api/v1/customer/auth/register
  const res = await apiInstance.post<ApiResponse<AuthResponse>>(`${BASE}/register`, data);
  return res.data.data;
};

export const logout = async (): Promise<void> => {
  // URL sẽ là: /api/v1/customer/auth/logout
  await apiInstance.post(`${BASE}/logout`);
};

export const refreshToken = async (token: string): Promise<{ accessToken: string }> => {
  // URL sẽ là: /api/v1/customer/auth/refresh-token
  const res = await apiInstance.post<ApiResponse<{ accessToken: string }>>(
    `${BASE}/refresh-token`,
    { refreshToken: token },
  );
  return res.data.data;
};

