import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { router } from 'expo-router';

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

// Response interceptor — handle errors and token expiration
apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Parse API error message
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }

    // Handle 401 — token expired → clear tokens and redirect to login
    if (error.response?.status === 401) {
      try {
        // Clear stored tokens
        if (Platform.OS === 'web') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        } else {
          await SecureStore.deleteItemAsync('accessToken');
          await SecureStore.deleteItemAsync('refreshToken');
          await SecureStore.deleteItemAsync('user');
        }

        // Redirect to login page
        const alertMsg = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        if (Platform.OS === 'web') {
          alert(alertMsg);
          // Use window.location for reliable web redirect
          window.location.href = '/login';
        } else {
          // Use expo-router for mobile
          router.replace('/login' as any);
        }
      } catch (cleanupError) {
        console.warn('Error during auth cleanup:', cleanupError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiInstance;
