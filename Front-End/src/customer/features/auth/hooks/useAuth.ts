import { useAuthStore } from '../store/auth.store';
import { login as loginApi, logout as logoutApi, register as registerApi } from '../api/auth.api';

export const useAuth = () => {
  const { user, accessToken, isAuthenticated, isLoading, error, setAuth, clearAuth, restoreSession } =
    useAuthStore();

  const login = async (email: string, password: string) => {
    useAuthStore.getState().setIsLoading(true);
    useAuthStore.getState().setError(null);
    try {
      const res = await loginApi(email, password);
      await setAuth(res);
      return res;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Đăng nhập thất bại';
      useAuthStore.getState().setError(msg);
      throw new Error(msg);
    } finally {
      useAuthStore.getState().setIsLoading(false);
    }
  };

  const logout = async () => {
    useAuthStore.getState().setIsLoading(true);
    try {
      await logoutApi();
    } catch {}
    await clearAuth();
    useAuthStore.getState().setIsLoading(false);
  };

  const register = async (
    email: string,
    password: string,
    username: string,
    role: 'customer',
  ) => {
    useAuthStore.getState().setIsLoading(true);
    useAuthStore.getState().setError(null);
    try {
      const res = await registerApi({ email, password, username, role });
      await setAuth(res);
      return res;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Đăng ký thất bại';
      useAuthStore.getState().setError(msg);
      throw new Error(msg);
    } finally {
      useAuthStore.getState().setIsLoading(false);
    }
  };

  return { user, accessToken, isAuthenticated, isLoading, error, login, logout, register, restoreSession };
};
