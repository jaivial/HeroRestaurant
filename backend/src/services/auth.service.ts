import { UserRepository } from '../repositories/user.repository';
import { SessionService } from './session.service';
import { hashPassword, verifyPassword } from '../utils/password';
import { Errors } from '../utils/errors';
import { DEFAULT_GLOBAL_FLAGS } from '../constants/permissions';
import type { User, Session } from '../types/database.types';
import type { LoginRequest, RegisterRequest } from '../types/auth.types';

export class AuthService {
  /**
   * Authenticates a user and creates a session
   */
  static async login(
    credentials: LoginRequest,
    ipAddress?: string
  ): Promise<{ user: User; sessionId: string; session: Session }> {
    const { email, password, deviceInfo } = credentials;

    // Find user by email
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw Errors.AUTH_INVALID_CREDENTIALS;
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      // TODO: Track failed login attempts
      throw Errors.AUTH_INVALID_CREDENTIALS;
    }

    // Check user status
    if (user.status === 'suspended') {
      throw Errors.AUTH_ACCOUNT_DISABLED;
    }

    // Create session
    const { sessionId, session } = await SessionService.create(
      user.id,
      deviceInfo,
      ipAddress
    );

    // Update last login
    await UserRepository.updateLastLogin(user.id);

    return { user, sessionId, session };
  }

  /**
   * Registers a new user and creates a session
   */
  static async register(
    data: RegisterRequest,
    ipAddress?: string
  ): Promise<{ user: User; sessionId: string; session: Session }> {
    const { email, password, name } = data;

    // Check if user already exists
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw Errors.CONFLICT('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with default global flags
    const user = await UserRepository.create({
      email,
      password_hash: passwordHash,
      name,
      avatar_url: null,
      phone: null,
      email_verified_at: null,
      status: 'active',
      global_flags: DEFAULT_GLOBAL_FLAGS,
      last_login_at: new Date(),
      deleted_at: null,
    });

    // Create session
    const { sessionId, session } = await SessionService.create(
      user.id,
      undefined,
      ipAddress
    );

    return { user, sessionId, session };
  }

  /**
   * Logs out a user (revokes current session)
   */
  static async logout(sessionId: string): Promise<void> {
    await SessionService.revoke(sessionId, 'logout');
  }

  /**
   * Logs out all sessions for a user
   */
  static async logoutAll(userId: string, currentSessionId?: string): Promise<number> {
    return await SessionService.revokeAllForUser(userId, 'logout', currentSessionId);
  }

  /**
   * Changes a user's password and revokes all other sessions
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    currentSessionId: string
  ): Promise<void> {
    // Get user
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw Errors.NOT_FOUND('User');
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      throw Errors.AUTH_INVALID_CREDENTIALS;
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await UserRepository.update(userId, {
      password_hash: passwordHash,
    });

    // Revoke all other sessions
    await SessionService.revokeAllForUser(userId, 'password_change', currentSessionId);
  }
}
