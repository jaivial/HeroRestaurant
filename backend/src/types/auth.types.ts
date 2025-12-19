/**
 * Authentication API Types
 *
 * DTOs for authentication-related API requests and responses.
 * These types match the actual API responses from auth.routes.ts
 */

import type { UserStatus } from './database.types';

// ============================================================================
// Request DTOs
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
  deviceInfo?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// ============================================================================
// Response DTOs - User
// ============================================================================

/** Basic user info returned on registration */
export interface UserBasicDTO {
  id: string;
  email: string;
  name: string;
}

/** User info returned on login */
export interface UserLoginDTO extends UserBasicDTO {
  globalFlags: string; // BigInt serialized as string for JSON
}

/** Full user info returned on /me endpoint */
export interface UserMeDTO extends UserLoginDTO {
  avatarUrl: string | null;
  status?: UserStatus;
  phone?: string | null;
  emailVerifiedAt?: string | null;
}

// ============================================================================
// Response DTOs - Session
// ============================================================================

/** Session info returned on login/register */
export interface SessionDTO {
  id: string;
  expiresAt: string; // ISO date string
}

/** Session info returned on /me endpoint */
export interface SessionMeDTO {
  expiresAt: string;
  createdAt: string;
}

/** Session info returned in /sessions list */
export interface SessionListItemDTO {
  id: string;
  userAgent: string | null;
  lastActivity: string;
  createdAt: string;
  current: boolean;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface RegisterResponse {
  user: UserBasicDTO;
  session: SessionDTO;
}

export interface LoginResponse {
  user: UserLoginDTO;
  session: SessionDTO;
}

export interface MeResponse {
  user: UserMeDTO;
  session: SessionMeDTO;
}

export interface SessionsResponse {
  sessions: SessionListItemDTO[];
}

export interface LogoutResponse {
  message: string;
}

export interface LogoutAllResponse {
  message: string;
  sessionsRevoked: number;
}
