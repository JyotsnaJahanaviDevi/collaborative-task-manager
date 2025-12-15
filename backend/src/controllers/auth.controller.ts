import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../dtos/auth.dto';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register endpoint
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate input
      const validatedData = registerSchema.parse(req.body);

      // Register user
      const result = await this.authService.register(validatedData);

      // Set HTTP-only cookie
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        data: result.user,
        token: result.token,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, message: error.errors[0].message });
      } else {
        res.status(400).json({ success: false, message: error.message });
      }
    }
  };

  /**
   * Login endpoint
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate input
      const validatedData = loginSchema.parse(req.body);

      // Login user
      const result = await this.authService.login(validatedData);

      // Set HTTP-only cookie
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        data: result.user,
        token: result.token,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, message: error.errors[0].message });
      } else {
        res.status(401).json({ success: false, message: error.message });
      }
    }
  };

  /**
   * Logout endpoint
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  };
}
