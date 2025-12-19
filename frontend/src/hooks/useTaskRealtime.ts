import { useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';

export function useTaskRealtime(mutate: () => void) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for task created
    socket.on('task-created', () => {
      mutate(); // Revalidate tasks
    });

    // Listen for task updated
    socket.on('task-updated', () => {
      mutate(); // Revalidate tasks
    });

    // Listen for task deleted
    socket.on('task-deleted', () => {
      mutate(); // Revalidate tasks
    });

    // Listen for task status changed
    socket.on('task-status-changed', () => {
      mutate(); // Revalidate tasks
    });

    return () => {
      socket.off('task-created');
      socket.off('task-updated');
      socket.off('task-deleted');
      socket.off('task-status-changed');
    };
  }, [socket, mutate]);
}
