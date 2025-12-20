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
      assignedToId: data.assignedToId,
      teamId: data.teamId,
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

    // Allow creator or assigned user to update
    const canUpdate = task.creatorId === userId || task.assignedToId === userId;
    
    if (!canUpdate) {
      throw new Error('Unauthorized to update this task');
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }
    
    // Check if assignee changed
    const previousAssigneeId = task.assignedToId;
    const newAssigneeId = data.assignedToId;
    const assigneeChanged = newAssigneeId !== undefined && newAssigneeId !== previousAssigneeId;

    const updatedTask = await this.taskRepository.update(id, updateData);

    return {
      ...updatedTask,
      assigneeChanged,
      newAssigneeId: assigneeChanged ? newAssigneeId : null,
    };
  }

  /**
   * Delete task
   */
  async deleteTask(id: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    // Only creator can delete
    if (task.creatorId !== userId) {
      throw new Error('Unauthorized to delete this task');
    }

    await this.taskRepository.delete(id);
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

  /**
   * Get overdue tasks for a user (assigned or created)
   */
  async getOverdueTasks(userId: string) {
    return this.taskRepository.findOverdue(userId);
  }
}
