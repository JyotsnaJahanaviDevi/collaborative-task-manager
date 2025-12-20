import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Task } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { tasksAPI, usersAPI } from '../../lib/api';
import toast from 'react-hot-toast';

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
  teamId?: string;
}

export default function TaskFormModal({ isOpen, onClose, task, onSuccess, teamId }: TaskFormModalProps) {
  const [assigneeEmail, setAssigneeEmail] = useState('');
  const [searchedUser, setSearchedUser] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [assignedToId, setAssignedToId] = useState<string | null>(null);
  
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
  const handleSearchUser = async () => {
    if (!assigneeEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsSearching(true);
    try {
      const response = await usersAPI.searchByEmail(assigneeEmail.trim());
      setSearchedUser(response.data);
      toast.success('User found!');
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('No user found with this email');
      } else {
        toast.error('Failed to search user');
      }
      setSearchedUser(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAssignUser = () => {
    if (searchedUser) {
      setAssignedToId(searchedUser.id);
      toast.success(`Assigned to ${searchedUser.name}`);
      setAssigneeEmail('');
      setSearchedUser(null);
    }
  };

  const handleRemoveAssignee = () => {
    setAssignedToId(null);
    toast.success('Assignee removed');
  };

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
      setAssignedToId(task.assignedTo?.id || null);
    } else {
      reset({
        title: '',
        description: '',
        dueDate: '',
        priority: 'MEDIUM',
        status: 'TODO',
      });
      setAssignedToId(null);
    }
  }, [task, reset]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      const formattedData = {
        ...data,
        dueDate: new Date(data.dueDate).toISOString(),
        assignedToId: assignedToId || undefined,
      };

      if (task) {
        await tasksAPI.update(task.id, formattedData);
        toast.success('Task updated successfully!');
      } else {
        // Remove status for create - backend will set default
        const { status, ...createData } = formattedData;
        const createPayload = {
          ...createData,
          teamId: teamId || undefined,
        };
        await tasksAPI.create(createPayload);
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

          {/* Assign To (Email Search) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assign To (Single User)
            </label>
            
            {/* Current Assignee */}
            {assignedToId && (
              <div className="mb-3 p-3 bg-pastel-mint/20 border-2 border-pastel-mint rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {task?.assignedTo?.name || searchedUser?.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {task?.assignedTo?.email || searchedUser?.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveAssignee}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Email Search */}
            {!assignedToId && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="email"
                      value={assigneeEmail}
                      onChange={(e) => setAssigneeEmail(e.target.value)}
                      placeholder="Enter user email (e.g., user@example.com)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchUser())}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleSearchUser}
                    disabled={isSearching}
                    className="px-6"
                  >
                    <Search size={18} />
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>

                {/* Search Result */}
                {searchedUser && (
                  <div className="p-3 bg-gray-50 border-2 border-gray-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{searchedUser.name}</p>
                      <p className="text-xs text-gray-600">{searchedUser.email}</p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAssignUser}
                      size="sm"
                    >
                      Assign
                    </Button>
                  </div>
                )}

                <p className="text-xs text-gray-600 font-medium">
                  💡 Enter the complete email address to search for a user
                </p>
              </div>
            )}
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
