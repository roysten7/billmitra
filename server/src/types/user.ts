export type UserRole = 'super_admin' | 'restaurant_admin' | 'staff';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  restaurant_id?: number | null;
  is_active: boolean;
  last_login?: Date | null;
  created_at: Date;
  updated_at: Date;
  reset_password_token?: string | null;
  reset_password_expires?: Date | null;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  restaurant_id?: number | null;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  restaurant_id?: number | null;
  is_active?: boolean;
  last_login?: Date | null;
  reset_password_token?: string | null;
  reset_password_expires?: Date | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash' | 'reset_password_token' | 'reset_password_expires'>;
  token: string;
}
