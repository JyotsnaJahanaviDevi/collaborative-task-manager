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
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
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
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, message: error.errors[0].message });
      } else {
        res.status(400).json({ success: false, message: error.message });
      }
    }
  };
}
