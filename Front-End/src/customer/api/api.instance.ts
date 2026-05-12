import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

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
  return 'http://192.168.1.100:5000';
};

const baseURL = getBaseUrl();
console.log('PARTNER API BASE URL:', baseURL);

const apiInstance = axios.create({
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
    const original = error.config;

    console.log('AXIOS ERROR STATUS:', error.response?.status);
    console.log('AXIOS ERROR URL:', error.config?.url);
    console.log('AXIOS ERROR METHOD:', error.config?.method);
    console.log('AXIOS ERROR DATA:', error.response?.data);

    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;
      // TODO: refresh token rồi retry nếu cần
    }

    return Promise.reject(error);
  }
);

export default apiInstance;