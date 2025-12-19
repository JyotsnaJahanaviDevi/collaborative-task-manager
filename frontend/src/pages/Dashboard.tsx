import { useState } from 'react';
import { CheckSquare, Clock, AlertCircle, TrendingUp, Plus } from 'lucide-react';
import type { Task } from '../types';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import TaskCard from '../components/tasks/TaskCard';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { tasksAPI } from '../lib/api';
import { useTaskRealtime } from '../hooks/useTaskRealtime';
import Button from '../components/ui/Button';
import TaskFormModal from '../components/tasks/TaskFormModal';
import { TopLoadingBar } from '../components/ui/TopLoadingBar';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  
  // Single API call for all dashboard data - much faster!
  const { data, isLoading, mutate } = useSWR(
    '/tasks/dashboard',
    tasksAPI.getDashboard,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
      keepPreviousData: true,
    }
  );

  // Enable real-time updates
  useTaskRealtime(mutate);

  const myTasks = data?.data?.assignedTasks || [];
  const createdTasks = data?.data?.createdTasks || [];
  const overdueTasks = data?.data?.overdueTasks || [];

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleDelete = async (taskId: string) => {
    try {
      await tasksAPI.delete(taskId);
      toast.success('Task deleted successfully!');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleCloseModal = () => {
    setShowTaskModal(false);
    setEditingTask(undefined);
  };

  const stats = [
    {
      icon: CheckSquare,
      label: 'Assigned to Me',
      value: myTasks?.length || 0,
      gradient: 'from-pastel-sky/80 via-pastel-lavender/80 to-pastel-lilac/80',
      iconBg: 'bg-gradient-to-br from-pastel-sky to-pastel-lavender',
    },
    {
      icon: TrendingUp,
      label: 'Created by Me',
      value: createdTasks?.length || 0,
      gradient: 'from-pastel-mint/80 via-pastel-sage/80 to-accent-mint/80',
      iconBg: 'bg-gradient-to-br from-pastel-mint to-accent-mint',
    },
    {
      icon: AlertCircle,
      label: 'Overdue Tasks',
      value: overdueTasks?.length || 0,
      gradient: 'from-pastel-rose/80 via-pastel-peach/80 to-accent-peach/80',
      iconBg: 'bg-gradient-to-br from-pastel-rose to-accent-peach',
    },
    {
      icon: Clock,
      label: 'In Progress',
      value: myTasks?.filter((t: Task) => t.status === 'IN_PROGRESS').length || 0,
      gradient: 'from-pastel-lavender/80 via-pastel-lilac/80 to-accent-lavender/80',
      iconBg: 'bg-gradient-to-br from-pastel-lavender to-accent-lavender',
    },
  ];

  return (
    <DashboardLayout>
      <TopLoadingBar isLoading={isLoading && !!data} />
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pastel-mint via-pastel-lavender to-pastel-sky bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 text-lg">Welcome back! Here's your task overview.</p>
          </div>
          <Button onClick={() => setShowTaskModal(true)}>
            <Plus size={20} />
            New Task
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index}>
              <Card hover className="cursor-pointer bg-gradient-to-br from-white/95 to-white/90 border-2 border-white/50">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-3xl ${stat.iconBg} flex items-center justify-center shadow-xl`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                    <p className={`text-4xl font-bold bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Recent Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CheckSquare className="text-blue-400" />
                My Tasks
              </h2>
              <Link to="/tasks" className="text-sm text-blue-400 hover:text-blue-300">
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {myTasks && myTasks.length > 0 ? (
                myTasks.slice(0, 3).map((task: Task) => (
                  <TaskCard key={task.id} task={task} onEdit={handleEdit} onDelete={handleDelete} />
                ))
              ) : createdTasks && createdTasks.length > 0 ? (
                <>
                  <Card>
                    <p className="text-gray-400 text-sm mb-3">No tasks assigned to you. Showing tasks you created:</p>
                  </Card>
                  {createdTasks.slice(0, 3).map((task: Task) => (
                    <TaskCard key={task.id} task={task} onEdit={handleEdit} onDelete={handleDelete} />
                  ))}
                </>
              ) : (
                <Card>
                  <p className="text-gray-400 text-center py-8">No tasks yet</p>
                </Card>
              )}
            </div>
          </div>

          {/* Overdue Tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <AlertCircle className="text-red-400" />
                Overdue Tasks
              </h2>
            </div>
            <div className="space-y-4">
              {overdueTasks && overdueTasks.length > 0 ? (
                overdueTasks.slice(0, 3).map((task: Task) => (
                  <TaskCard key={task.id} task={task} onEdit={handleEdit} onDelete={handleDelete} />
                ))
              ) : (
                <Card>
                  <p className="text-gray-400 text-center py-8">🎉 No overdue tasks!</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={showTaskModal}
        onClose={handleCloseModal}
        task={editingTask}
        onSuccess={() => mutate()}
      />
    </DashboardLayout>
  );
}
