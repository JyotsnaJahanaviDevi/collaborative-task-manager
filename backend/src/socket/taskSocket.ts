import { Server, Socket } from 'socket.io';

interface UserSocket extends Socket {
  userId?: string;
}

interface TaskAssignData {
  taskId: string;
  assignedToId: string;
  task: {
    title: string;
    creator?: {
      name: string;
    };
  };
}

/**
 * Initialize task-related socket events
 */
export const initializeTaskSocket = (io: Server) => {
  io.on('connection', (socket: UserSocket) => {
    // User joins their personal room for notifications
    socket.on('join', (userId: string) => {
      socket.userId = userId;
      socket.join(`user:${userId}`);
    });

    // Broadcast task assignment notification
    socket.on('task:assign', (data: TaskAssignData) => {
      // Emit to the assigned user
      io.to(`user:${data.assignedToId}`).emit('task-assigned', {
        taskId: data.taskId,
        taskTitle: data.task.title,
        assignedBy: data.task.creator?.name || 'Someone',
      });
    });

    socket.on('disconnect', () => {
      // Connection closed
    });
  });
};
