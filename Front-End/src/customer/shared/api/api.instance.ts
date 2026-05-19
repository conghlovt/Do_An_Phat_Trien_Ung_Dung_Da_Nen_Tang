import { create, type InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { ApiResponse } from '../types/api.types';

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const getStoredItem = async (key: string) => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
};

const setStoredItem = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
};

const removeStoredItem = async (key: string) => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
};

const clearStoredAuth = async () => {
  await Promise.all([
    removeStoredItem('accessToken'),
    removeStoredItem('refreshToken'),
    removeStoredItem('user'),
  ]);
};

const getBaseUrl = () => {
  // Ưu tiên lấy từ biến môi trường
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Android emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  // Web / iOS / fallback
  // Nếu backend của bạn đã test OK ở IP này thì dùng IP LAN thật
  return 'http://localhost:5000';
};

const baseURL = getBaseUrl();
console.log('CUSTOMER API BASE URL:', baseURL);

const apiInstance = create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

apiInstance.interceptors.request.use(async (config) => {
  let token: string | null = null;

  try {
    token =
      Platform.OS === 'web'
        ? localStorage.getItem('accessToken')
        : await SecureStore.getItemAsync('accessToken');
  } catch (err) {
    console.log('Lỗi khi lấy accessToken:', err);
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as RetryableRequestConfig | undefined;

    console.log('AXIOS ERROR STATUS:', error.response?.status);
    console.log('AXIOS ERROR URL:', error.config?.url);
    console.log('AXIOS ERROR METHOD:', error.config?.method);
    console.log('AXIOS ERROR DATA:', error.response?.data);

    if (error.response?.status === 401 && !original?._retry) {
      const isAuthEndpoint = original?.url?.includes('/api/customer/auth/');
      const isRefreshEndpoint = original?.url?.includes('/refresh-token');

      if (!original || isRefreshEndpoint) {
        await clearStoredAuth();
        return Promise.reject(error);
      }

      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      original._retry = true;
      const refreshToken = await getStoredItem('refreshToken');

      if (!refreshToken) {
        await clearStoredAuth();
        return Promise.reject(error);
      }

      try {
        const response = await apiInstance.post<ApiResponse<{ accessToken: string }>>(
          '/api/customer/auth/refresh-token',
          { refreshToken },
        );
        const nextAccessToken = response.data.data.accessToken;
        await setStoredItem('accessToken', nextAccessToken);
        original.headers.Authorization = `Bearer ${nextAccessToken}`;
        return apiInstance(original);
      } catch (refreshError) {
        await clearStoredAuth();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiInstance;
