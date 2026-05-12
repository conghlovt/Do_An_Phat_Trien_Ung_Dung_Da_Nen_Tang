import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000/api/v1'
  : 'http://192.168.0.100:5000/api/v1';

const apiInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — attach JWT token
apiInstance.interceptors.request.use(
  async (config) => {
    let token: string | null = null;
    if (Platform.OS === 'web') {
      token = localStorage.getItem('accessToken');
    } else {
      token = await SecureStore.getItemAsync('accessToken');
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — extract error message from API response
apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Parse API error message
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    // Handle 401 — token expired
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // TODO: Implement refresh token logic
    }
    return Promise.reject(error);
  }
);

export default apiInstance;
