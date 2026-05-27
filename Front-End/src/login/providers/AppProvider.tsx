import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { getCurrentUser as getLoginCurrentUser } from '../api/auth.api';
import { getCurrentUser as getCustomerCurrentUser } from '../../customer/api/auth.api';
import { useAuthStore as useLoginAuthStore } from '../store/auth.store';
import { useAuthStore as useCustomerAuthStore } from '../../customer/store/auth.store';
import { forceLogout, getBlockedAuthMessage, isBlockedAuthError } from '../shared/api/api.instance';

const SESSION_POLL_INTERVAL_MS = 20_000;
const BLOCKED_MESSAGE = 'Tài khoản của bạn đã bị chặn. Vui lòng liên hệ quản trị viên.';

const getInitialActiveState = () => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    return document.visibilityState === 'visible';
  }

  return AppState.currentState === 'active';
};

export const AppProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    restoreSession,
    isAuthenticated: isLoginAuthenticated,
    isLoading: isLoginLoading,
  } = useLoginAuthStore();
  const isCustomerAuthenticated = useCustomerAuthStore((state) => state.isAuthenticated);
  const [isAppActive, setIsAppActive] = useState(getInitialActiveState);
  const checkingRef = useRef(false);
  const isAuthenticated = isLoginAuthenticated || isCustomerAuthenticated;

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (isLoginLoading || isLoginAuthenticated) return;
    if (pathname.startsWith('/admin') || pathname.startsWith('/partner')) {
      router.replace('/login' as any);
    }
  }, [isLoginAuthenticated, isLoginLoading, pathname, router]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const handleVisibilityChange = () => setIsAppActive(document.visibilityState === 'visible');
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }

    const subscription = AppState.addEventListener('change', (state) => {
      setIsAppActive(state === 'active');
    });
    return () => subscription.remove();
  }, []);

  const checkSession = useCallback(async () => {
    if (!isAppActive || checkingRef.current) return;

    const isCustomerRoute = pathname.startsWith('/customer');
    const hasLoginSession = useLoginAuthStore.getState().isAuthenticated;
    const hasCustomerSession = useCustomerAuthStore.getState().isAuthenticated;
    if (isCustomerRoute ? !hasCustomerSession : !hasLoginSession) return;

    checkingRef.current = true;
    try {
      if (isCustomerRoute) {
        await getCustomerCurrentUser();
      } else {
        await getLoginCurrentUser();
      }
    } catch (error: any) {
      const status = error?.response?.status;
      if (isBlockedAuthError(error)) {
        await forceLogout(getBlockedAuthMessage(error) || BLOCKED_MESSAGE);
        router.replace('/login' as any);
      } else if (status === 401 || status === 403) {
        await forceLogout(error?.response?.data?.message || 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
        router.replace('/login' as any);
      }
    } finally {
      checkingRef.current = false;
    }
  }, [isAppActive, pathname, router]);

  useEffect(() => {
    if (!isAuthenticated || !isAppActive) return;

    void checkSession();
    const intervalId = setInterval(() => {
      void checkSession();
    }, SESSION_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [checkSession, isAppActive, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !isAppActive) return;
    void checkSession();
  }, [checkSession, isAppActive, isAuthenticated, pathname]);

  return <>{children}</>;
};
