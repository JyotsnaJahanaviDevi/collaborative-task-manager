import { TaskRepository, TaskFilters } from '../repositories/task.repository';
import { CreateTaskDto, UpdateTaskDto } from '../dtos/task.dto';
import { Priority } from '@prisma/client';

export class TaskService {
  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  /**
   * Create a new task
   */
  async createTask(data: CreateTaskDto, creatorId: string) {
    const task = await this.taskRepository.create({
      ...data,
      dueDate: new Date(data.dueDate),
      priority: data.priority as Priority,
      creatorId,
    });

    return task;
  }

  /**
   * Get all tasks with filters
   */
  async getTasks(filters: TaskFilters) {
    return this.taskRepository.findAll(filters);
  }

  /**
   * Get single task by ID
   */
  async getTaskById(id: string) {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  }

  /**
   * Update task
   */
  async updateTask(id: string, data: UpdateTaskDto, userId: string) {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    // Only creator can update task
    if (task.creatorId !== userId) {
      throw new Error('Unauthorized to update this task');
    }

    const updateData: any = { ...data };
    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    return this.taskRepository.update(id, updateData);
  }

  /**
   * Delete task
   */
  async deleteTask(id: string, userId: string) {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    // Only creator can delete task
    if (task.creatorId !== userId) {
      throw new Error('Unauthorized to delete this task');
    }

    return this.taskRepository.delete(id);
  }

  /**
   * Get user's dashboard data
   */
  async getDashboard(userId: string) {
    const [assignedTasks, createdTasks, overdueTasks] = await Promise.all([
      this.taskRepository.findAll({ assignedToId: userId }),
      this.taskRepository.findAll({ creatorId: userId }),
      this.taskRepository.findOverdue(userId),
    ]);

    return {
      assignedTasks,
      createdTasks,
      overdueTasks,
    };
  }
}
