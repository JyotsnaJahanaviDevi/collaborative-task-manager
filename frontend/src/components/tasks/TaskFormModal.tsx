import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Task } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { tasksAPI, usersAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import useSWR from 'swr';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  onSuccess: () => void;
}

export default function TaskFormModal({ isOpen, onClose, task, onSuccess }: TaskFormModalProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'MEDIUM',
      status: 'TODO',
    },
  });

  // Fetch all users for assignment dropdown
  const { data: usersData } = useSWR('/users', usersAPI.getAll);
  const users = usersData?.data || [];

  // Update form when task changes
  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate.split('T')[0],
        priority: task.priority,
        status: task.status,
      });
      // Set selected assignees
      setSelectedUserIds(task.assignees?.map(a => a.userId) || []);
    } else {
      reset({
        title: '',
        description: '',
        dueDate: '',
        priority: 'MEDIUM',
        status: 'TODO',
      });
      setSelectedUserIds([]);
    }
  }, [task, reset]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      const formattedData = {
        ...data,
        dueDate: new Date(data.dueDate).toISOString(),
        assigneeIds: selectedUserIds.length > 0 ? selectedUserIds : undefined,
      };

      if (task) {
        await tasksAPI.update(task.id, formattedData);
        toast.success('Task updated successfully!');
      } else {
        // Remove status for create - backend will set default
        const { status, ...createData } = formattedData;
        await tasksAPI.create(createData);
        toast.success('Task created successfully!');
      }

      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save task');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('title')}
              placeholder="Enter task title"
              error={errors.title?.message}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Enter task description"
              className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pastel-mint hover:border-gray-300 transition-all shadow-sm"
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.description.message}</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              {...register('dueDate')}
              error={errors.dueDate?.message}
            />
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                {...register('priority')}
                className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-gray-200 text-gray-800 focus:outline-none focus:border-pastel-mint hover:border-gray-300 transition-all shadow-sm"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                {...register('status')}
                className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-gray-200 text-gray-800 focus:outline-none focus:border-pastel-mint hover:border-gray-300 transition-all shadow-sm"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Assign To (Multiple Users) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assign To (Multiple Users)
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border-2 border-gray-200 rounded-2xl p-3">
              {users.map((user: any) => (
                <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUserIds([...selectedUserIds, user.id]);
                      } else {
                        setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
                      }
                    }}
                    className="w-4 h-4 text-pastel-mint border-gray-300 rounded focus:ring-pastel-mint"
                  />
                  <span className="text-sm text-gray-700 font-medium">{user.name}</span>
                  <span className="text-xs text-gray-500">({user.email})</span>
                </label>
              ))}
              {users.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">No users available</p>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-600 font-medium">
              {selectedUserIds.length === 0
                ? 'Select team members to assign this task'
                : `${selectedUserIds.length} user(s) selected`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
