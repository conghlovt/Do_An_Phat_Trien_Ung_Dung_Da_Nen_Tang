import * as SQLite from 'expo-sqlite';
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

export const userProfileStorage = {
  saveCurrentUser: async (user: User) => {
    try {
      const db = await getDb();
      if (!db) return;
      await db.runAsync(
        'INSERT OR REPLACE INTO user_profile (id, data) VALUES (?, ?)',
        ['currentUser', JSON.stringify(user)]
      );
    } catch (error) {
      console.error('Failed to save user to SQLite:', error);
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
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
      console.error('Failed to get user from SQLite:', error);
      return null;
    }
  },

  clearCurrentUser: async () => {
    try {
      const db = await getDb();
      if (!db) return;
      await db.runAsync('DELETE FROM user_profile WHERE id = ?', ['currentUser']);
    } catch (error) {
      console.error('Failed to clear user from SQLite:', error);
    }
  },
};
