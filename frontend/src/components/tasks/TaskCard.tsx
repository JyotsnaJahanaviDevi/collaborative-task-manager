import { motion } from 'framer-motion';
import { Calendar, Users, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import type { Task } from '../../types';
import { format, isPast } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const priorityColors = {
  LOW: 'bg-blue-100 text-blue-700 border-blue-300',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-300',
  URGENT: 'bg-red-100 text-red-700 border-red-300',
};

const statusColors = {
  TODO: 'bg-slate-100 text-slate-700 border-slate-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-300',
  REVIEW: 'bg-purple-100 text-purple-700 border-purple-300',
  COMPLETED: 'bg-green-100 text-green-700 border-green-300',
};

const priorityLabels = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

const statusLabels = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  COMPLETED: 'Completed',
};

export default function TaskCard({ task, onClick, onEdit, onDelete }: TaskCardProps) {
  const isOverdue = isPast(new Date(task.dueDate)) && task.status !== 'COMPLETED';

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete?.(task.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="glass p-6 rounded-2xl border border-white/10 cursor-pointer hover:border-blue-500/50 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {task.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {task.description}
          </p>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-2 ml-2">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                title="Edit task"
              >
                <Edit2 size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                title="Delete task"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={`px-3 py-1 rounded-lg text-xs font-medium border ${priorityColors[task.priority]}`}
        >
          {priorityLabels[task.priority]}
        </span>
        <span
          className={`px-3 py-1 rounded-lg text-xs font-medium border ${statusColors[task.status]}`}
        >
          {statusLabels[task.status]}
        </span>
        {isOverdue && (
          <span className="px-3 py-1 rounded-lg text-xs font-medium border bg-red-100 text-red-700 border-red-300 flex items-center gap-1">
            <AlertCircle size={12} />
            Overdue
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>{format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
        </div>
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>
              {task.assignees.length === 1
                ? task.assignees[0].user.name
                : `${task.assignees.length} assignees`}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
