export type Role = 'admin' | 'partner' | 'customer' | 'SUPER_ADMIN' | 'OPERATOR' | 'ACCOUNTANT';

export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
  avatar?: string;
  code?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
