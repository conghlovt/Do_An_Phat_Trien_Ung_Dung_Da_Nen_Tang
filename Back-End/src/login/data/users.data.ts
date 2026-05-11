import { type User } from '../models/user.model';
import bcrypt from 'bcryptjs';

// Pre-hash passwords for default users
const hashedPassword = bcrypt.hashSync('123456', 10);

export const users: User[] = [
  {
    id: '1',
    email: 'admin@gmail.com',
    password: hashedPassword,
    username: 'Admin',
    role: 'admin',
    code: 'AD01',
    avatar: 'https://i.pravatar.cc/150?u=1',
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'partner@gmail.com',
    password: hashedPassword,
    username: 'Partner',
    role: 'partner',
    code: 'PT01',
    avatar: 'https://i.pravatar.cc/150?u=2',
    createdAt: new Date(),
  },
  {
    id: '3',
    email: 'customer@gmail.com',
    password: hashedPassword,
    username: 'Customer',
    role: 'customer',
    code: 'CUS01',
    avatar: 'https://i.pravatar.cc/150?u=3',
    createdAt: new Date(),
  },
];
