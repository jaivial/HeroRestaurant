import { UserRepository } from '../repositories/user.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { Errors } from '../utils/errors';
import type { User, UserUpdate } from '../types/database.types';

export class UserService {
  /**
   * Gets a user by ID
   */
  static async getById(id: string): Promise<User> {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw Errors.NOT_FOUND('User');
    }
    return user;
  }

  /**
   * Gets a user by email
   */
  static async getByEmail(email: string): Promise<User> {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw Errors.NOT_FOUND('User');
    }
    return user;
  }

  /**
   * Updates a user's profile
   */
  static async update(userId: string, data: UserUpdate): Promise<User> {
    // Check if user exists
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw Errors.NOT_FOUND('User');
    }

    // If email is being changed, check it's not already taken
    if (data.email && data.email !== user.email) {
      const existingUser = await UserRepository.findByEmail(data.email);
      if (existingUser) {
        throw Errors.CONFLICT('Email already in use');
      }
    }

    return await UserRepository.update(userId, data);
  }

  /**
   * Gets all restaurants a user belongs to
   */
  static async getUserRestaurants(userId: string) {
    const memberships = await MembershipRepository.findByUserId(userId);
    return memberships;
  }
}
