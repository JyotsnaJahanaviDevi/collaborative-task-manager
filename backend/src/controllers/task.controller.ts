import { Response } from 'express';
import { TaskService } from '../services/task.service';
import { createTaskSchema, updateTaskSchema } from '../dtos/task.dto';
import { AuthRequest } from '../middleware/auth.middleware';

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  /**
   * Create task endpoint
   */
  createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const validatedData = createTaskSchema.parse(req.body);
      const task = await this.taskService.createTask(validatedData, req.user!.userId);

      // Emit Socket.io event for real-time update
      const io = req.app.get('io');
      io.emit('task:created', task);

      res.status(201).json({ success: true, data: task });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, message: error.errors[0].message });
      } else {
        res.status(400).json({ success: false, message: error.message });
      }
    }
  };

  /**
   * Get all tasks with filters
   */
  getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status, priority, sortBy, sortOrder } = req.query;

      const tasks = await this.taskService.getTasks({
        status: status as any,
        priority: priority as any,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
      });

      res.status(200).json({ success: true, data: tasks });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  /**
   * Get single task
   */
  getTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const task = await this.taskService.getTaskById(req.params.id);
      res.status(200).json({ success: true, data: task });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  };

  /**
   * Update task
   */
  updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const validatedData = updateTaskSchema.parse(req.body);
      const task = await this.taskService.updateTask(req.params.id, validatedData, req.user!.userId);

      // Emit Socket.io event
      const io = req.app.get('io');
      io.emit('task:updated', task);

      res.status(200).json({ success: true, data: task });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, message: error.errors[0].message });
      } else if (error.message === 'Task not found') {
        res.status(404).json({ success: false, message: error.message });
      } else if (error.message.includes('Unauthorized')) {
        res.status(403).json({ success: false, message: error.message });
      } else {
        res.status(400).json({ success: false, message: error.message });
      }
    }
  };

  /**
   * Delete task
   */
  deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await this.taskService.deleteTask(req.params.id, req.user!.userId);

      // Emit Socket.io event
      const io = req.app.get('io');
      io.emit('task:deleted', { id: req.params.id });

      res.status(200).json({ success: true, message: 'Task deleted successfully' });
    } catch (error: any) {
      if (error.message === 'Task not found') {
        res.status(404).json({ success: false, message: error.message });
      } else if (error.message.includes('Unauthorized')) {
        res.status(403).json({ success: false, message: error.message });
      } else {
        res.status(400).json({ success: false, message: error.message });
      }
    }
  };

  /**
   * Get dashboard data
   */
  getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const dashboard = await this.taskService.getDashboard(req.user!.userId);
      res.status(200).json({ success: true, data: dashboard });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}
