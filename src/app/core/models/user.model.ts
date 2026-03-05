export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  clientId?: string; // links to Client for client-role users
  phone?: string;
  title?: string;
}
