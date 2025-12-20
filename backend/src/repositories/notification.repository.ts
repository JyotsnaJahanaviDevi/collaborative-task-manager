import prisma from '../config/database';

export class NotificationRepository {
  async create(data: { userId: string; message: string; type?: string }) {
    return prisma.notification.create({ data });
  }

  async findByUserId(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async delete(id: string) {
    return prisma.notification.delete({ where: { id } });
  }

  async deleteAll(userId: string) {
    return prisma.notification.deleteMany({ where: { userId } });
  }
}
