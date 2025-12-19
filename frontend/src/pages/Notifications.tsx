import { motion } from 'framer-motion';
import { Bell, Check, Trash2 } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useNotifications } from '../contexts/NotificationContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
              <Bell size={32} />
              Notifications
              {unreadCount > 0 && (
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-gray-400 mt-1">
              Stay updated with task assignments and changes
            </p>
          </div>
          <div className="flex gap-3">
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline">
                <Check size={20} />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button onClick={clearAll} variant="outline">
                <Trash2 size={20} />
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
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
                            className="text-white hover:text-blue-400 transition-colors"
                          >
                            {notification.message}
                          </Link>
                          <p className="text-sm text-gray-400 mt-1">
                            {format(new Date(notification.createdAt), 'MMM dd, yyyy • hh:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                        title="Mark as read"
                      >
                        <Check size={18} />
                      </button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <Bell size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">No notifications yet</p>
              <p className="text-gray-500 text-sm mt-2">
                You'll see notifications here when tasks are assigned to you or updated
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
