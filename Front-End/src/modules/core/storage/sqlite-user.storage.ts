import { type User } from '../../auth/types/auth.types';

const USER_KEY = 'user';

const webStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

const parseUser = (value: string | null): User | null => {
  if (!value) return null;

  try {
    return JSON.parse(value) as User;
  } catch {
    return null;
  }
};

export const userProfileStorage = {
  saveCurrentUser: async (user: User) => {
    webStorage()?.setItem(USER_KEY, JSON.stringify(user));
  },

  getCurrentUser: async (): Promise<User | null> => {
    return parseUser(webStorage()?.getItem(USER_KEY) || null);
  },

  clearCurrentUser: async () => {
    webStorage()?.removeItem(USER_KEY);
  },
};
