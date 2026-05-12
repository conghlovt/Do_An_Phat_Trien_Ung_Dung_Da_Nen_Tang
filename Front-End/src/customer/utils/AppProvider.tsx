import React, { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return <>{children}</>;
};
