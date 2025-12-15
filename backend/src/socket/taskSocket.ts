import { Server, Socket } from 'socket.io';

interface UserSocket extends Socket {
  userId?: string;
}

/**
 * Initialize task-related socket events
 */
export const initializeTaskSocket = (io: Server) => {
  io.on('connection', (socket: UserSocket) => {
    console.log('User connected:', socket.id);

    // User joins their personal room for notifications
    socket.on('join', (userId: string) => {
      socket.userId = userId;
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Broadcast task assignment notification
    socket.on('task:assign', (data: { taskId: string; assignedToId: string; task: any }) => {
      io.to(`user:${data.assignedToId}`).emit('notification:assignment', {
        message: `You have been assigned to task: ${data.task.title}`,
        task: data.task,
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
