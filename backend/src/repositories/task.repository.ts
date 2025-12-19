import { Task, Priority, Status } from '@prisma/client';
import prisma from '../config/database';

export interface TaskFilters {
  status?: Status;
  priority?: Priority;
  creatorId?: string;
  assignedToUserId?: string;
  sortBy?: 'dueDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface TaskWithAssignees extends Task {
  creator: { id: string; name: string; email: string };
  assignees: Array<{ user: { id: string; name: string; email: string } }>;
}

/**
 * Task Repository - Handles database operations for tasks
 */
export class TaskRepository {
  /**
   * Create a new task with assignees
   */
  async create(data: {
    title: string;
    description: string;
    dueDate: Date;
    priority: Priority;
    creatorId: string;
    assigneeIds?: string[];
  }): Promise<TaskWithAssignees> {
    const { assigneeIds, ...taskData } = data;
    
    return prisma.task.create({
      data: {
        ...taskData,
        assignees: assigneeIds?.length
          ? {
              create: assigneeIds.map(userId => ({ userId })),
            }
          : undefined,
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignees: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    }) as Promise<TaskWithAssignees>;
  }

  /**
   * Find all tasks with filters
   */
  async findAll(filters: TaskFilters): Promise<TaskWithAssignees[]> {
    const { status, priority, creatorId, assignedToUserId, sortBy = 'dueDate', sortOrder = 'asc' } = filters;

    return prisma.task.findMany({
      where: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(creatorId && { creatorId }),
        ...(assignedToUserId && {
          assignees: {
            some: { userId: assignedToUserId },
          },
        }),
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignees: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
    }) as Promise<TaskWithAssignees[]>;
  }

  /**
   * Find task by ID
   */
  async findById(id: string): Promise<TaskWithAssignees | null> {
    return prisma.task.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignees: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    }) as Promise<TaskWithAssignees | null>;
  }

  /**
   * Update task
   */
  async update(id: string, data: Partial<Task> & { assigneeIds?: string[] }): Promise<TaskWithAssignees> {
    const { assigneeIds, ...taskData } = data;
    
    // If assigneeIds provided, update assignments
    if (assigneeIds !== undefined) {
      // Delete existing assignments and create new ones
      await prisma.taskAssignment.deleteMany({ where: { taskId: id } });
      
      if (assigneeIds.length > 0) {
        await prisma.taskAssignment.createMany({
          data: assigneeIds.map(userId => ({ taskId: id, userId })),
        });
      }
    }
    
    return prisma.task.update({
      where: { id },
      data: taskData,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignees: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    }) as Promise<TaskWithAssignees>;
  }

  /**
   * Delete task
   */
  async delete(id: string): Promise<Task> {
    return prisma.task.delete({ where: { id } });
  }

  /**
   * Get overdue tasks for a user
   */
  async findOverdue(userId: string): Promise<TaskWithAssignees[]> {
    const now = new Date();
    return prisma.task.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { assignees: { some: { userId } } },
        ],
        dueDate: { lt: now },
        status: { not: 'COMPLETED' },
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignees: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    }) as Promise<TaskWithAssignees[]>;
  }
}
