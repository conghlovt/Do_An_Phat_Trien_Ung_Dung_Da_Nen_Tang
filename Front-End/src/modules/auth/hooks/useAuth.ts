import { useAuthStore } from '../store/auth.store';
import { login as loginApi, logout as logoutApi, register as registerApi } from '../api/auth.api';

export const useAuth = () => {
  const { user, accessToken, isAuthenticated, isLoading, error, setAuth, clearAuth, restoreSession } = useAuthStore();

  const login = async (email: string, password: string) => {
    try {
      useAuthStore.getState().setIsLoading(true);
      const res = await loginApi({ email, password });
      await setAuth(res);
      return res;
    } catch (err: any) {
      useAuthStore.getState().setError(err.message || 'Login failed');
      throw err;
    } finally {
      useAuthStore.getState().setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      useAuthStore.getState().setIsLoading(true);
      await logoutApi();
      await clearAuth();
    } catch (err: any) {
      console.error('Logout failed:', err);
    } finally {
      useAuthStore.getState().setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string, role: 'customer' | 'partner') => {
    try {
      useAuthStore.getState().setIsLoading(true);
      const res = await registerApi({ email, password, username, role });
      await setAuth(res);
      return res;
    } catch (err: any) {
      useAuthStore.getState().setError(err.message || 'Registration failed');
      throw err;
    } finally {
      useAuthStore.getState().setIsLoading(false);
    }
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    restoreSession,
  };
};