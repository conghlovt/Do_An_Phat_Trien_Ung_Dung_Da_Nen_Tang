import { type AuthResponse } from '../types/auth.types';
import apiInstance from '../shared/api/api.instance';
import { type ApiSuccess } from '../shared/types/api.types';

export const login = async ({ email, password }: any): Promise<AuthResponse> => {
  const response = await apiInstance.post<ApiSuccess<AuthResponse>>('/auth/login', {
    email,
    password,
  });
  return response.data.data;
};

export const logout = async (): Promise<void> => {
  await apiInstance.post('/auth/logout');
};


export const register = async (data: any): Promise<AuthResponse> => {
  const response = await apiInstance.post<ApiSuccess<AuthResponse>>('/auth/register', data);
  return response.data.data;
};

export const refreshToken = async (token: string): Promise<{ accessToken: string; refreshToken?: string }> => {
  const response = await apiInstance.post<ApiSuccess<{ accessToken: string; refreshToken?: string }>>('/auth/refresh-token', {
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
