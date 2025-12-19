import { Response } from 'express';
import { TaskService } from '../services/task.service';
import { createTaskSchema, updateTaskSchema } from '../dtos/task.dto';
import { AuthRequest } from '../middleware/auth.middleware';
import { Status, Priority } from '@prisma/client';

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
      io.emit('task-created', task);

      // If task is assigned, notify the assignee
      if (task.assignedToId) {
        io.to(`user:${task.assignedToId}`).emit('task-assigned', {
          taskId: task.id,
          taskTitle: task.title,
          assignedBy: req.user!.name || 'Someone',
        });
      }

      res.status(201).json({ success: true, data: task });
    } catch (error) {
      console.error('❌ Create task error:', error);
      if (error instanceof Error && 'name' in error && error.name === 'ZodError') {
        res.status(400).json({ success: false, message: (error as any).errors[0].message });
      } else {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
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
        status: status as Status | undefined,
        priority: priority as Priority | undefined,
        sortBy: sortBy as 'dueDate' | 'createdAt' | undefined,
        sortOrder: sortOrder as 'asc' | 'desc' | undefined,
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
    } catch (error) {
      res.status(404).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  /**
 * Update task
 */
updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = updateTaskSchema.parse(req.body);
    const result = await this.taskService.updateTask(req.params.id, validatedData, req.user!.userId);

    // Emit Socket.io event for task update
    const io = req.app.get('io');
    io.emit('task-updated', result);

    // If task was assigned, emit notification
    if (result.wasAssigned && result.assignedToId) {
      io.to(`user:${result.assignedToId}`).emit('task-assigned', {
        taskId: result.id,
        taskTitle: result.title,
        assignedBy: req.user!.name || 'Someone',
      });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof Error && 'name' in error && error.name === 'ZodError') {
      res.status(400).json({ success: false, message: (error as any).errors[0].message });
    } else if (error instanceof Error && error.message === 'Task not found') {
      res.status(404).json({ success: false, message: error.message });
    } else if (error instanceof Error && error.message.includes('Unauthorized')) {
      res.status(403).json({ success: false, message: error.message });
    } else {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
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
      io.emit('task-deleted', req.params.id);

      res.status(200).json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Task not found') {
        res.status(404).json({ success: false, message: error.message });
      } else if (error instanceof Error && error.message.includes('Unauthorized')) {
        res.status(403).json({ success: false, message: error.message });
      } else {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  };

  /**
   * Get dashboard data
   */
  getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      console.log('📊 Dashboard request for user:', req.user?.userId);
      const dashboard = await this.taskService.getDashboard(req.user!.userId);
      res.status(200).json({ success: true, data: dashboard });
    } catch (error) {
      console.error('❌ Dashboard error:', error);
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  /**
   * Get tasks assigned to current user
   */
  getMyTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tasks = await this.taskService.getTasks({ assignedToId: req.user!.userId });
      res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  /**
   * Get tasks created by current user
   */
  getCreatedTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tasks = await this.taskService.getTasks({ creatorId: req.user!.userId });
      res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  /**
   * Get overdue tasks for current user
   */
  getOverdueTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tasks = await this.taskService.getOverdueTasks(req.user!.userId);
      res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };
}
