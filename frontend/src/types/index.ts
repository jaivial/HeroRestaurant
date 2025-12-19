// Global types for the application

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  permissions: bigint;
}

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

export interface RouteConfig {
  requiresAuth: boolean;
  requiredPermissions?: bigint[];
  permissionMode?: 'all' | 'any';
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  workspace?: Workspace;
  token?: string;
  error?: string;
}
