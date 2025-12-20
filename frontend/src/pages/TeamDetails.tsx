import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, Filter, Search, X, ArrowLeft } from 'lucide-react';
import useSWR from 'swr';
import DashboardLayout from '../components/layout/DashboardLayout';
import TaskCard from '../components/tasks/TaskCard';
import TaskFormModal from '../components/tasks/TaskFormModal';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { TopLoadingBar } from '../components/ui/TopLoadingBar';
import { teamsAPI, tasksAPI } from '../lib/api';
import { useTasks } from '../hooks/useTasks';
import { useTaskRealtime } from '../hooks/useTaskRealtime';
import toast from 'react-hot-toast';
import type { Task } from '../types';

export default function TeamDetails() {
  const { id: teamId } = useParams();
  const [showFilters, setShowFilters] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    status?: string;
    priority?: string;
    sortBy?: string;
  }>({});

  const { data: teamData } = useSWR(teamId ? `/teams/${teamId}` : null, () =>
    teamId ? teamsAPI.getById(teamId) : null
  );
  const team = teamData?.data;

  const { tasks, isLoading, mutate } = useTasks({
    ...filters,
    teamId: teamId,
  });

  useTaskRealtime(mutate);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

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

  const filteredTasks = tasks?.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <TopLoadingBar isLoading={isLoading && !!tasks} />
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-gray-600">
          <Link to="/teams" className="flex items-center gap-2 hover:text-gray-900">
            <ArrowLeft size={18} />
            Back to Teams
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold gradient-text">
              {team?.name || 'Team'}
            </h1>
            <p className="text-gray-700 mt-1">
              {team?.description || 'Manage tasks for this team'}
            </p>
          </div>
          <Button onClick={() => setShowTaskModal(true)} className="w-full md:w-auto">
            <Plus size={20} />
            New Task
          </Button>
        </div>

        <div className="glass p-4 rounded-2xl border border-white/10 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Filter size={20} />
              <span>Filters</span>
              {(filters.status || filters.priority || filters.sortBy) && (
                <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                  Active
                </span>
              )}
            </button>
            {(filters.status || filters.priority || filters.sortBy || searchQuery) && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Status"
                value={filters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="COMPLETED">Completed</option>
              </Select>

              <Select
                label="Priority"
                value={filters.priority || 'all'}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </Select>

              <Select
                label="Sort By"
                value={filters.sortBy || 'all'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="all">Default</option>
                <option value="dueDate-asc">Due Date (Earliest)</option>
                <option value="dueDate-desc">Due Date (Latest)</option>
                <option value="priority">Priority</option>
                <option value="createdAt">Created Date</option>
              </Select>
            </div>
          )}
        </div>

        {filteredTasks && filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="glass p-12 rounded-2xl border border-white/10 text-center">
            <p className="text-gray-400 text-lg">
              {searchQuery || filters.status || filters.priority
                ? 'No tasks match your filters'
                : 'No tasks yet. Create your first team task!'}
            </p>
          </div>
        )}

        {filteredTasks && filteredTasks.length > 0 && (
          <div className="text-center text-gray-400 text-sm">
            Showing {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
            {(searchQuery || filters.status || filters.priority) && ` (filtered)`}
          </div>
        )}
      </div>

      <TaskFormModal
        isOpen={showTaskModal}
        onClose={handleCloseModal}
        task={editingTask}
        onSuccess={() => mutate()}
        teamId={teamId}
      />
    </DashboardLayout>
  );
}
