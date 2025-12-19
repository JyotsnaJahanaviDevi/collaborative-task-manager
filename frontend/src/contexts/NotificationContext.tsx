import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Notification } from '../types';
import { useSocket } from './SocketContext';
import toast from 'react-hot-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for task assignment notifications
    socket.on('task-assigned', (data: { taskId: string; taskTitle: string; assignedBy: string }) => {
      const notification: Notification = {
        id: Date.now().toString(),
        message: `${data.assignedBy} assigned you a task: "${data.taskTitle}"`,
        taskId: data.taskId,
        read: false,
        createdAt: new Date().toISOString(),
      };

      setNotifications((prev) => [notification, ...prev]);
      toast.success(notification.message, { duration: 4000 });
    });

    // Listen for task updates
    socket.on('task-updated', (data: { taskId: string; taskTitle: string; updatedBy: string; field: string }) => {
      const notification: Notification = {
        id: Date.now().toString(),
        message: `${data.updatedBy} updated "${data.taskTitle}"`,
        taskId: data.taskId,
        read: false,
        createdAt: new Date().toISOString(),
      };

      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.off('task-assigned');
      socket.off('task-updated');
    };
  }, [socket]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
