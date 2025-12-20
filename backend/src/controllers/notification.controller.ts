import { Response } from 'express';
import { NotificationRepository } from '../repositories/notification.repository';
import { AuthRequest } from '../middleware/auth.middleware';

export class NotificationController {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const notifications = await this.notificationRepository.findByUserId(req.user!.userId);
      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await this.notificationRepository.markAsRead(req.params.id);
      res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await this.notificationRepository.markAllAsRead(req.user!.userId);
      res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await this.notificationRepository.delete(req.params.id);
      res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  clearAll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await this.notificationRepository.deleteAll(req.user!.userId);
      res.status(200).json({ success: true, message: 'All notifications cleared' });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };
}
