export interface User {
  id: string;
  email: string;
  password?: string;
  username: string;
  role: 'admin' | 'partner' | 'customer';
  code: string;
  avatar?: string;
  createdAt: Date;
}
