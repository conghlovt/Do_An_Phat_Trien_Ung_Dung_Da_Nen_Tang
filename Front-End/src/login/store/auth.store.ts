import { create } from 'zustand';
import { AuthState, AuthResponse } from '../types/auth.types';
import { tokenStorage } from '../shared/storage/secure-token.storage';
import { userProfileStorage } from '../shared/storage/sqlite-user.storage';

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
      await Promise.all([
        tokenStorage.saveTokens(data.accessToken, data.refreshToken),
        userProfileStorage.saveCurrentUser(data.user),
      ]);
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
      await Promise.all([
        tokenStorage.clearTokens(),
        userProfileStorage.clearCurrentUser(),
      ]);
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
      const [refreshTokenValue, user, accessToken] = await Promise.all([
        tokenStorage.getRefreshToken(),
        userProfileStorage.getCurrentUser(),
        tokenStorage.getAccessToken(),
      ]);

      if (refreshTokenValue && user) {
        set({
          user,
          isAuthenticated: true,
          accessToken: accessToken || null,
        });
      } else {
        set({ isAuthenticated: false, user: null });
      }
    } catch {
      set({ isAuthenticated: false, user: null });
    } finally {
      set({ isLoading: false });
    }
  }
}));
