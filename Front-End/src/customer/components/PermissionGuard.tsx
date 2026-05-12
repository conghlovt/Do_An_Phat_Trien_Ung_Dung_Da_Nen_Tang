import React from 'react';
import { useCan } from '../hooks/useCan';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback = null,
}) => {
  const can = useCan(permission);

  if (!can) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
