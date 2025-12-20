/**
 * Auth Service - REST API based authentication
 *
 * Handles login, register, logout and session management via REST API.
 * WebSocket connections should only be established AFTER successful authentication.
 */

import { apiClient } from '@/utils/api';
import type {
  UserDTO,
  SessionDTO,
  RestaurantMinimalDTO,
} from '@/websocket/types';

// ============================================================================
// Request Types
// ============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
  deviceInfo?: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ConfirmEmailRequest {
  token: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface AuthResponse {
  success: true;
  data: {
    user: UserDTO;
    session: SessionDTO;
    restaurants?: RestaurantMinimalDTO[];
  };
}

export interface MeResponse {
  success: true;
  data: {
    user: UserDTO;
    session: {
      expiresAt: string;
      createdAt: string;
    };
    restaurants: RestaurantMinimalDTO[];
  };
}

export interface MessageResponse {
  success: true;
  data: {
    message: string;
  };
}

export interface SessionListResponse {
  success: true;
  data: {
    sessions: Array<{
      id: string;
      deviceInfo: string | null;
      ipAddress: string | null;
      createdAt: string;
      lastActiveAt: string;
      isCurrent: boolean;
    }>;
  };
}

// ============================================================================
// Auth Service
// ============================================================================

class AuthApiService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  }

  /**
   * Register a new account
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', credentials);
  }

  /**
   * Logout current session
   */
  async logout(token: string): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/auth/logout', {}, { token });
  }

  /**
   * Logout all sessions except current
   */
  async logoutAll(token: string): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/auth/logout-all', {}, { token });
  }

  /**
   * Get current user and session info
   */
  async me(token: string): Promise<MeResponse> {
    return apiClient.get<MeResponse>('/auth/me', { token });
  }

  /**
   * Get all active sessions for current user
   */
  async getSessions(token: string): Promise<SessionListResponse> {
    return apiClient.get<SessionListResponse>('/auth/sessions', { token });
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(
    sessionId: string,
    token: string
  ): Promise<MessageResponse> {
    return apiClient.delete<MessageResponse>(`/auth/sessions/${sessionId}`, {
      token,
    });
  }

  /**
   * Request password reset email
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/auth/forgot-password', data);
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/auth/reset-password', data);
  }

  /**
   * Confirm email with token
   */
  async confirmEmail(data: ConfirmEmailRequest): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/auth/confirm-email', data);
  }

  /**
   * Resend confirmation email
   */
  async resendConfirmation(email: string): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/auth/resend-confirmation', {
      email,
    });
  }
}

export const authService = new AuthApiService();
