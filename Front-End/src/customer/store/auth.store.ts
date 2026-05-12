import { create } from 'zustand';
import { AuthState, User, AuthResponse } from '../types/auth.types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface AuthStore extends AuthState {
  setAuth: (data: AuthResponse) => Promise<void>;
  clearAuth: () => Promise<void>;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setAuth: async (data: AuthResponse) => {
    set({
      user: data.user,
      accessToken: data.accessToken,
      isAuthenticated: true,
      error: null,
    });
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        await SecureStore.setItemAsync('accessToken', data.accessToken);
        await SecureStore.setItemAsync('refreshToken', data.refreshToken);
        await SecureStore.setItemAsync('user', JSON.stringify(data.user));
      }
    } catch (e) {
      console.error('Error saving auth state', e);
    }
  },

  clearAuth: async () => {
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      error: null,
    });
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } else {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('user');
      }
    } catch (e) {
      console.error('Error clearing auth state', e);
    }
  },

  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  restoreSession: async () => {
    try {
      set({ isLoading: true });
      let refreshTokenValue;
      let userStr;
      let accessToken;

      if (Platform.OS === 'web') {
        refreshTokenValue = localStorage.getItem('refreshToken');
        userStr = localStorage.getItem('user');
        accessToken = localStorage.getItem('accessToken');
      } else {
        refreshTokenValue = await SecureStore.getItemAsync('refreshToken');
        userStr = await SecureStore.getItemAsync('user');
        accessToken = await SecureStore.getItemAsync('accessToken');
      }
      
      if (refreshTokenValue && userStr) {
        // In a real app, you might want to call refresh API here to get a fresh accessToken
        // For now, we'll use the one we found or the user will be prompted to login if it fails later
        set({
          user: JSON.parse(userStr),
          isAuthenticated: true,
          accessToken: accessToken || null,
        });
      } else {
        set({ isAuthenticated: false, user: null });
      }
    } catch (e) {
      set({ isAuthenticated: false, user: null });
    } finally {
      set({ isLoading: false });
    }
  }
}));