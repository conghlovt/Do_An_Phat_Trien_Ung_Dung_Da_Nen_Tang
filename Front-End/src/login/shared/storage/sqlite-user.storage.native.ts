import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';
import { type User } from '../../types/auth.types';

const DATABASE_NAME = 'stayhub_app.db';
const CURRENT_USER_KEY = 'current';
const LEGACY_USER_KEY = 'user';

type UserRow = {
  id: string;
  email: string;
  username: string;
  role: User['role'];
  avatar?: string | null;
  code?: string | null;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

const getDatabase = async () => {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS current_user (
          session_key TEXT PRIMARY KEY NOT NULL,
          id TEXT NOT NULL,
          email TEXT NOT NULL,
          username TEXT NOT NULL,
          role TEXT NOT NULL,
          avatar TEXT,
          code TEXT,
          updated_at TEXT NOT NULL
        );
      `);
      return db;
    });
  }

  return databasePromise;
};

const parseUser = (value: string | null): User | null => {
  if (!value) return null;

  try {
    return JSON.parse(value) as User;
  } catch {
    return null;
  }
};

const toUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  username: row.username,
  role: row.role,
  ...(row.avatar ? { avatar: row.avatar } : {}),
  ...(row.code ? { code: row.code } : {}),
});

export const userProfileStorage = {
  saveCurrentUser: async (user: User) => {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO current_user (session_key, id, email, username, role, avatar, code, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(session_key) DO UPDATE SET
         id = excluded.id,
         email = excluded.email,
         username = excluded.username,
         role = excluded.role,
         avatar = excluded.avatar,
         code = excluded.code,
         updated_at = excluded.updated_at`,
      CURRENT_USER_KEY,
      user.id,
      user.email,
      user.username,
      user.role,
      user.avatar || null,
      user.code || null,
      new Date().toISOString(),
    );
  },

  getCurrentUser: async (): Promise<User | null> => {
    const db = await getDatabase();
    const row = await db.getFirstAsync<UserRow>(
      'SELECT id, email, username, role, avatar, code FROM current_user WHERE session_key = ? LIMIT 1',
      CURRENT_USER_KEY,
    );

    if (row) return toUser(row);

    const legacyUser = parseUser(await SecureStore.getItemAsync(LEGACY_USER_KEY));
    if (legacyUser) {
      await userProfileStorage.saveCurrentUser(legacyUser);
      await SecureStore.deleteItemAsync(LEGACY_USER_KEY);
    }

    return legacyUser;
  },

  clearCurrentUser: async () => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM current_user WHERE session_key = ?', CURRENT_USER_KEY);
    await SecureStore.deleteItemAsync(LEGACY_USER_KEY);
  },
};
