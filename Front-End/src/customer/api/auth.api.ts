import apiInstance from '@/src/customer/core/api/api.instance';
import { type ApiResponse } from '@/src/customer/core/types/api.types';
import { type AuthResponse } from '@/src/customer/types/auth.types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Khớp với app.use('/api/customer', customerRoutes) trong backend.
const BASE = '/api/customer/auth';

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  // URL sẽ là: /api/customer/auth/login
  const res = await apiInstance.post<ApiResponse<AuthResponse>>(`${BASE}/login`, { email, password });
  return res.data.data;
};

export const register = async (data: {
  email: string;
  password: string;
  username: string;
  role: 'customer'; // Fix cứng role là customer cho an toàn
}): Promise<AuthResponse> => {
  // URL sẽ là: /api/customer/auth/register
  const res = await apiInstance.post<ApiResponse<AuthResponse>>(`${BASE}/register`, data);
  return res.data.data;
};

export const logout = async (): Promise<void> => {
  // URL sẽ là: /api/customer/auth/logout
  const refreshToken =
    Platform.OS === 'web'
      ? localStorage.getItem('refreshToken')
      : await SecureStore.getItemAsync('refreshToken');

  await apiInstance.post(`${BASE}/logout`, refreshToken ? { refreshToken } : {});
};

export const refreshToken = async (token: string): Promise<{ accessToken: string }> => {
  // URL sẽ là: /api/customer/auth/refresh-token
  const res = await apiInstance.post<ApiResponse<{ accessToken: string }>>(
    `${BASE}/refresh-token`,
    { refreshToken: token },
  );
  return res.data.data;
};
