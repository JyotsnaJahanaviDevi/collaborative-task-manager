import { User } from '@prisma/client';
import prisma from '../config/database';

/**
 * User Repository - Handles database operations for users
 */
export class UserRepository {
  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  /**
   * Create a new user
   */
  async create(data: { email: string; password: string; name: string }): Promise<User> {
    return prisma.user.create({ data });
  }

  /**
   * Update user profile
   */
  async update(id: string, data: { name?: string }): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }
}
