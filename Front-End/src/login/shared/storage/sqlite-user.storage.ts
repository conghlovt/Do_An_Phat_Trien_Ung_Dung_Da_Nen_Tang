import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { type User } from '../../types/auth.types';

let dbInstance: SQLite.SQLiteDatabase | null = null;

const getDb = async () => {
  if (dbInstance) return dbInstance;
  try {
    // expo-sqlite v14+ API
    dbInstance = await SQLite.openDatabaseAsync('userProfile.db');
    await dbInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );
    `);
    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize SQLite database:', error);
    return null;
  }
};

const WEB_USER_KEY = 'stayhub_current_user';

export const userProfileStorage = {
  saveCurrentUser: async (user: User) => {
    try {
      if (Platform.OS === 'web' && user.role === 'customer') {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(WEB_USER_KEY, JSON.stringify(user));
        }
        return;
      }
      const db = await getDb();
      if (!db) return;
      await db.runAsync(
        'INSERT OR REPLACE INTO user_profile (id, data) VALUES (?, ?)',
        ['currentUser', JSON.stringify(user)]
      );
    } catch (error) {
      console.error('Failed to save user to storage:', error);
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          const data = window.localStorage.getItem(WEB_USER_KEY);
          if (data) {
            const user = JSON.parse(data) as User;
            if (user.role === 'customer') {
              return user;
            }
          }
        }
      }
      
      const db = await getDb();
      if (!db) return null;
      
      const result = await db.getFirstAsync<{ data: string }>(
        'SELECT data FROM user_profile WHERE id = ?',
        ['currentUser']
      );
      
      if (result && result.data) {
        return JSON.parse(result.data) as User;
      }
      return null;
    } catch (error) {
      console.error('Failed to get user from storage:', error);
      return null;
    }
  },

  clearCurrentUser: async () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(WEB_USER_KEY);
        }
      }
      const db = await getDb();
      if (!db) return;
      await db.runAsync('DELETE FROM user_profile WHERE id = ?', ['currentUser']);
    } catch (error) {
      console.error('Failed to clear user from storage:', error);
    }
  },
};
