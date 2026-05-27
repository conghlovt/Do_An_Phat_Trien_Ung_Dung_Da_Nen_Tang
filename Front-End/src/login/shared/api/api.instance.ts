import axios, { create, type InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { tokenStorage } from '../storage/secure-token.storage';
import { type ApiSuccess } from '../types/api.types';
import { useAuthStore } from '../../store/auth.store';

const API_PORT = process.env.EXPO_PUBLIC_API_PORT || '5000';
const API_PATH = process.env.EXPO_PUBLIC_API_PATH || '/api';

const normalizePath = (path: string) => (path.startsWith('/') ? path : `/${path}`);

const getHostFromUri = (uri?: string | null) => {
  if (!uri) return null;

  const withoutProtocol = uri.replace(/^[a-z]+:\/\//i, '');
  return withoutProtocol.split('/')[0]?.split(':')[0] || null;
};

const getExpoHost = () => {
  const constants = Constants as any;
  const candidateUris = [
    constants.expoConfig?.hostUri,
    constants.manifest?.debuggerHost,
    constants.manifest?.hostUri,
    constants.manifest2?.extra?.expoClient?.hostUri,
    constants.manifest2?.extra?.expoGo?.debuggerHost,
  ];

  for (const uri of candidateUris) {
    const host = getHostFromUri(uri);
    if (host) return host;
  }

  return null;
};

const getWebHost = () => {
  if (typeof window === 'undefined') return null;
  return window.location.hostname || null;
};

const getDefaultApiHost = () => {
  if (Platform.OS === 'web') {
    const webHost = getWebHost();
    if (webHost && webHost !== '0.0.0.0') return webHost;
  }

  return getExpoHost() || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
};

const resolveBaseUrl = () => {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envBaseUrl) return envBaseUrl.replace(/\/$/, '');

  return `http://${getDefaultApiHost()}:${API_PORT}${normalizePath(API_PATH)}`;
};

export const BASE_URL = resolveBaseUrl();

const apiInstance = create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

const isPublicAuthRequest = (url?: string) => {
  if (!url) return false;
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
};

const clearClientSession = async () => {
  try {
    await useAuthStore.getState().clearAuth();
    try {
      const customerStore = await import('../../../customer/store/auth.store');
      await customerStore.useAuthStore.getState().clearAuth();
    } catch {
      // Customer auth store is not always loaded.
    }
  } catch {
    await tokenStorage.clearTokens();
  }
};

const BLOCKED_ACCOUNT_MESSAGE = 'Tài khoản của bạn đã bị chặn. Vui lòng liên hệ quản trị viên.';
let forceLogoutPromise: Promise<void> | null = null;
let hasForcedLogout = false;

export const resetForceLogoutGuard = () => {
  hasForcedLogout = false;
  forceLogoutPromise = null;
};

export const getApiErrorCode = (error: any) => {
  const data = error?.response?.data;
  return data?.code || data?.internalCode || data?.error?.code || null;
};

export const getApiErrorMessage = (error: any) => {
  const data = error?.response?.data;
  return data?.message || data?.error?.message || error?.message || '';
};

export const isBlockedAuthError = (error: any) => {
  const code = String(getApiErrorCode(error) || '');
  const message = String(getApiErrorMessage(error) || '').toLowerCase();
  return code === 'AUTH_USER_BLOCKED' || message.includes('bị chặn') || message.includes('bị khóa') || message.includes('blocked');
};

export const getBlockedAuthMessage = (error: any) => {
  const message = getApiErrorMessage(error);
  return message || BLOCKED_ACCOUNT_MESSAGE;
};

export const forceLogout = async (message = BLOCKED_ACCOUNT_MESSAGE) => {
  if (hasForcedLogout) return forceLogoutPromise || Promise.resolve();

  hasForcedLogout = true;
  forceLogoutPromise = (async () => {
    try {
      await clearClientSession();
    } finally {
      useAuthStore.getState().setError(message);
      try {
        const customerStore = await import('../../../customer/store/auth.store');
        customerStore.useAuthStore.getState().setError(message);
      } catch {
        // Customer auth store is not always loaded.
      }
    }
  })();

  return forceLogoutPromise;
};

// Interceptor to add token to headers
apiInstance.interceptors.request.use(
  async (config) => {
    const token = await tokenStorage.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle token expiration
apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh-token');
    const shouldRefreshToken = !isRefreshRequest && !isPublicAuthRequest(originalRequest?.url);

    if (isBlockedAuthError(error)) {
      await forceLogout(getBlockedAuthMessage(error));
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      const message = getApiErrorMessage(error) || 'Bạn không có quyền thực hiện thao tác này.';
      useAuthStore.getState().setError(message);
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && shouldRefreshToken) {
      originalRequest._retry = true;
      const refreshToken = await tokenStorage.getRefreshToken();

      if (refreshToken) {
        try {
          const response = await axios.post<ApiSuccess<{ accessToken: string; refreshToken?: string }>>(`${BASE_URL}/auth/refresh-token`, { refreshToken });
          const accessToken = response.data?.data?.accessToken;
          const nextRefreshToken = response.data?.data?.refreshToken;

          if (accessToken) {
            if (nextRefreshToken) {
              await tokenStorage.saveTokens(accessToken, nextRefreshToken);
            } else {
              await tokenStorage.saveAccessToken(accessToken);
            }

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiInstance(originalRequest);
          }
        } catch (refreshError) {
          if (isBlockedAuthError(refreshError)) {
            await forceLogout(getBlockedAuthMessage(refreshError));
          } else {
            await clearClientSession();
          }
          return Promise.reject(refreshError);
        }
      }

      await clearClientSession();
    }

    if (error.response?.status === 401 && isRefreshRequest) {
      await clearClientSession();
    }

    return Promise.reject(error);
  }
);

export default apiInstance;
