import { useAuthStore } from '../store/auth.store';
import { hasPermission } from '../utils/permissions';

export const useCan = (permission: string) => {
  const { user } = useAuthStore();
  
  return hasPermission(user?.role, permission);
};