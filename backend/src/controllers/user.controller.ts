import { Response } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export class UserController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Get current user profile
   */
  getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await this.userRepository.findById(req.user!.userId);
      
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  /**
   * Update user profile
   */
  updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const validatedData = updateProfileSchema.parse(req.body);
      
      const user = await this.userRepository.update(req.user!.userId, validatedData);

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      if (error instanceof Error && 'name' in error && error.name === 'ZodError') {
        res.status(400).json({ success: false, message: (error as any).errors[0].message });
      } else {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  };

  /**
   * Get all users (for task assignment)
   */
  getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const users = await this.userRepository.findAll();
      
      res.status(200).json({
        success: true,
        data: users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
        })),
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  /**
   * Search users by email
   */
  searchByEmail = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { email } = req.query;
      
      if (!email || typeof email !== 'string') {
        res.status(400).json({ success: false, message: 'Email query parameter is required' });
        return;
      }

      const user = await this.userRepository.findByEmail(email);
      
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  /**
   * Delete user account
   */
  deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await this.userRepository.delete(req.user!.userId);
      
      res.status(200).json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };
}
