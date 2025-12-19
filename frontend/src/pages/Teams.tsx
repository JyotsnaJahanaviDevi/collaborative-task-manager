import { useState } from 'react';
import { Users, Plus, UserPlus, Trash2, Crown } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { teamsAPI, usersAPI } from '../lib/api';

const teamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100),
  description: z.string().optional(),
});

type TeamFormData = z.infer<typeof teamSchema>;

export default function Teams() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const { data: teamsData, mutate } = useSWR('/teams', teamsAPI.getAll);
  const { data: usersData } = useSWR('/users', usersAPI.getAll);
  const teams = teamsData?.data || [];
  const users = usersData?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
  });

  const onSubmit = async (data: TeamFormData) => {
    try {
      await teamsAPI.create(data);
      toast.success('Team created successfully!');
      reset();
      setShowCreateModal(false);
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedTeam) return;
    
    try {
      await teamsAPI.addMember(selectedTeam.id, { userId, role: 'member' });
      toast.success('Member added successfully!');
      mutate();
      setShowAddMemberModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (teamId: string, userId: string) => {
    if (!window.confirm('Remove this member from the team?')) return;

    try {
      await teamsAPI.removeMember(teamId, userId);
      toast.success('Member removed successfully!');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm('Delete this team? All team tasks will be unassigned.')) return;

    try {
      await teamsAPI.delete(teamId);
      toast.success('Team deleted successfully!');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete team');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold gradient-text">Teams</h1>
            <p className="text-gray-700 mt-1">
              Create and manage collaboration teams
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="w-full md:w-auto">
            <Plus size={20} />
            New Team
          </Button>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team: any) => (
            <Card key={team.id} className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white">{team.name}</h3>
                  {team.description && (
                    <p className="text-gray-400 text-sm mt-1">{team.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteTeam(team.id)}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Members</span>
                  <button
                    onClick={() => {
                      setSelectedTeam(team);
                      setShowAddMemberModal(true);
                    }}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                  >
                    <UserPlus size={14} />
                    Add
                  </button>
                </div>

                <div className="space-y-1">
                  {team.members?.map((member: any) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {member.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{member.user.name}</p>
                          {member.role === 'admin' && (
                            <span className="flex items-center gap-1 text-xs text-yellow-400">
                              <Crown size={10} />
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                      {member.role !== 'admin' && (
                        <button
                          onClick={() => handleRemoveMember(team.id, member.userId)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{team._count?.tasks || 0} tasks</span>
                  <span>•</span>
                  <span>Created by {team.creator.name}</span>
                </div>
              </div>
            </Card>
          ))}

          {teams.length === 0 && (
            <div className="col-span-full">
              <Card className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">No teams yet</h3>
                <p className="text-gray-500 mb-4">Create your first team to start collaborating</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus size={20} />
                  Create Team
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          reset();
        }}
        title="Create New Team"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Team Name <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('name')}
              placeholder="Enter team name"
              error={errors.name?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Description (Optional)
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Enter team description"
              className="w-full px-4 py-3 rounded-2xl bg-gray-800/80 border-2 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Creating...' : 'Create Team'}
            </Button>
            <Button
              type="button"
              onClick={() => setShowCreateModal(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        title="Add Team Member"
      >
        <div className="space-y-2">
          {users
            .filter((user: any) => !selectedTeam?.members?.some((m: any) => m.userId === user.id))
            .map((user: any) => (
              <button
                key={user.id}
                onClick={() => handleAddMember(user.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </button>
            ))}
          {users.filter((user: any) => !selectedTeam?.members?.some((m: any) => m.userId === user.id)).length === 0 && (
            <p className="text-center text-gray-400 py-4">All users are already members</p>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
}
