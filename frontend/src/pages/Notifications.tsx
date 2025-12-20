import { motion } from 'framer-motion';
import { Bell, Check, Trash2, X } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { notificationsAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { useSocket } from '../contexts/SocketContext';
import { useEffect } from 'react';
import type { Notification } from '../types';

export default function Notifications() {
  const { data, mutate } = useSWR('/notifications', notificationsAPI.getAll);
  const notifications = data?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.read).length;
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on('task-assigned', () => mutate());
    return () => {
      socket.off('task-assigned');
    };
  }, [socket, mutate]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      mutate();
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      toast.success('All notifications marked as read');
      mutate();
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsAPI.delete(id);
      toast.success('Notification deleted');
      mutate();
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all notifications?')) return;
    try {
      await notificationsAPI.clearAll();
      toast.success('All notifications cleared');
      mutate();
    } catch (error) {
      toast.error('Failed to clear notifications');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-5xl font-bold gradient-text">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-gray-700 mt-1">
              Stay updated with task assignments and changes
            </p>
          </div>
          <div className="flex gap-3">
            {unreadCount > 0 && (
              <Button onClick={handleMarkAllAsRead} variant="outline">
                <Check size={20} />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button onClick={handleClearAll} variant="outline">
                <Trash2 size={20} />
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification: Notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card
                  hover
                  className={`cursor-pointer ${
                    !notification.read ? 'border-blue-500/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            notification.read ? 'bg-gray-500' : 'bg-blue-500'
                          }`}
                        />
                        <div className="flex-1">
                          <Link
                            to={`/tasks`}
                            className="text-gray-800 hover:text-pastel-mint transition-colors font-medium"
                          >
                            {notification.message}
                          </Link>
                          <p className="text-sm text-gray-600 mt-1">
                            {format(new Date(notification.createdAt), 'MMM dd, yyyy • hh:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
                          title="Mark as read"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors text-gray-600 hover:text-red-600"
                        title="Delete"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <Bell size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-700 text-lg font-medium">No notifications yet</p>
              <p className="text-gray-600 text-sm mt-2">
                You'll see notifications here when tasks are assigned to you or updated
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
