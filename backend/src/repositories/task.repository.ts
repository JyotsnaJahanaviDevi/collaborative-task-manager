import { Task, Priority, Status } from '@prisma/client';
import prisma from '../config/database';

export interface TaskFilters {
  status?: Status;
  priority?: Priority;
  creatorId?: string;
  assignedToId?: string;
  sortBy?: 'dueDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Task Repository - Handles database operations for tasks
 */
export class TaskRepository {
  /**
   * Create a new task
   */
  async create(data: {
    title: string;
    description: string;
    dueDate: Date;
    priority: Priority;
    creatorId: string;
    assignedToId?: string;
  }): Promise<Task> {
    return prisma.task.create({
      data,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Find all tasks with filters
   */
  async findAll(filters: TaskFilters): Promise<Task[]> {
    const { status, priority, creatorId, assignedToId, sortBy = 'dueDate', sortOrder = 'asc' } = filters;

    return prisma.task.findMany({
      where: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(creatorId && { creatorId }),
        ...(assignedToId && { assignedToId }),
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { [sortBy]: sortOrder },
    });
  }

  /**
   * Find task by ID
   */
  async findById(id: string): Promise<Task | null> {
    return prisma.task.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Update task
   */
  async update(id: string, data: Partial<Task>): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });
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
  async findOverdue(userId: string): Promise<Task[]> {
    const now = new Date();
    return prisma.task.findMany({
      where: {
        OR: [{ creatorId: userId }, { assignedToId: userId }],
        dueDate: { lt: now },
        status: { not: 'COMPLETED' },
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }
}
