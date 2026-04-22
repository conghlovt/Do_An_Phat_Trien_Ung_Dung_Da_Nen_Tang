import { type AuthResponse } from '../types/auth.types';
import apiInstance from '../../core/api/api.instance';
import { type ApiResponse } from '../../core/types/api.types';

export const login = async ({ email, password }: any): Promise<AuthResponse> => {
  const response = await apiInstance.post<ApiResponse<AuthResponse>>('/auth/login', {
    email,
    password,
  });
  return response.data.data;
};

export const logout = async (): Promise<void> => {
  await apiInstance.post('/auth/logout');
};


export const register = async (data: any): Promise<AuthResponse> => {
  const response = await apiInstance.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return response.data.data;
};

export const refreshToken = async (token: string): Promise<{ accessToken: string }> => {
  const response = await apiInstance.post<ApiResponse<{ accessToken: string }>>('/auth/refresh-token', {
    refreshToken: token,
  });
  return response.data.data;
};

export const forgotPassword = async (email: string): Promise<void> => {
  await apiInstance.post('/auth/forgot-password', { email });
};

export const resetPassword = async (data: any): Promise<void> => {
  await apiInstance.post('/auth/reset-password', data);
};

