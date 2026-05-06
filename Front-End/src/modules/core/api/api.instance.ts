import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { tokenStorage } from '../storage/secure-token.storage';

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

const apiInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh-token')) {
      originalRequest._retry = true;
      const refreshToken = await tokenStorage.getRefreshToken();

      if (refreshToken) {
        const response = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
        const accessToken = response.data?.data?.accessToken;

        if (accessToken) {
          await tokenStorage.saveAccessToken(accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiInstance(originalRequest);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiInstance;
