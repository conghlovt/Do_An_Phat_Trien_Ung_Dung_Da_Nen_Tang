import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const webStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

const getItem = async (key: string) => {
  if (Platform.OS === 'web') {
    return webStorage()?.getItem(key) || null;
  }

  return SecureStore.getItemAsync(key);
};

const setItem = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    webStorage()?.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
};

const deleteItem = async (key: string) => {
  if (Platform.OS === 'web') {
    webStorage()?.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
};

export const tokenStorage = {
  getAccessToken: () => getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => getItem(REFRESH_TOKEN_KEY),

  saveTokens: async (accessToken: string, refreshToken: string) => {
    await Promise.all([
      setItem(ACCESS_TOKEN_KEY, accessToken),
      setItem(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },

  saveAccessToken: async (accessToken: string) => {
    await setItem(ACCESS_TOKEN_KEY, accessToken);
  },

  clearTokens: async () => {
    await Promise.all([
      deleteItem(ACCESS_TOKEN_KEY),
      deleteItem(REFRESH_TOKEN_KEY),
    ]);
  },
};
