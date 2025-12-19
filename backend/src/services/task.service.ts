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
      assigneeIds: data.assigneeIds,
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

    // Allow creator, assigned user, or anyone if task is unassigned
    const isAssignee = task.assignees?.some(a => a.user.id === userId);
    const canUpdate = task.creatorId === userId || 
                     isAssignee || 
                     task.assignees?.length === 0;
    
    if (!canUpdate) {
      throw new Error('Unauthorized to update this task');
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }
    
    // Get previous assignees to check for new assignments
    const previousAssigneeIds = task.assignees?.map(a => a.user.id) || [];

    const updatedTask = await this.taskRepository.update(id, updateData);

    // Return task with assignment info for notification
    const newAssigneeIds = data.assigneeIds || [];
    const addedAssignees = newAssigneeIds.filter(id => !previousAssigneeIds.includes(id));
    
    return {
      ...updatedTask,
      newlyAssignedUserIds: addedAssignees,
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

    // Allow creator or assigned users to delete
    const isAssignee = task.assignees?.some(a => a.user.id === userId);
    const canDelete = task.creatorId === userId || 
                     isAssignee || 
                     task.assignees?.length === 0;
    
    if (!canDelete) {
      throw new Error('Unauthorized to delete this task');
    }

    return this.taskRepository.delete(id);
  }

  /**
   * Get user's dashboard data
   */
  async getDashboard(userId: string) {
    const [assignedTasks, createdTasks, overdueTasks] = await Promise.all([
      this.taskRepository.findAll({ assignedToUserId: userId }),
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
