import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, UserPlus, Trash2, Crown, Search, X } from 'lucide-react';
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
import { useSocket } from '../contexts/SocketContext';

const teamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100),
  description: z.string().optional(),
});

type TeamFormData = z.infer<typeof teamSchema>;

export default function Teams() {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [searchedUser, setSearchedUser] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const { socket } = useSocket();

  const { data: teamsData, mutate } = useSWR('/teams', teamsAPI.getAll);
  const teams = teamsData?.data || [];

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on('team-created', () => mutate());
    socket.on('team-updated', () => mutate());
    socket.on('team-deleted', () => mutate());

    return () => {
      socket.off('team-created');
      socket.off('team-updated');
      socket.off('team-deleted');
    };
  }, [socket, mutate]);

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
      await teamsAPI.create({
        ...data,
        memberIds: selectedMembers.map(m => m.id),
      });
      toast.success('Team created successfully!');
      reset();
      setShowCreateModal(false);
      setSelectedMembers([]);
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    }
  };

  const handleSearchUser = async () => {
    if (!memberEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsSearching(true);
    try {
      const response = await usersAPI.searchByEmail(memberEmail.trim());
      const user = response.data;
      
      // Check if user is already added
      if (selectedMembers.some(m => m.id === user.id)) {
        toast.error('User already added to team');
        setSearchedUser(null);
      } else {
        setSearchedUser(user);
        toast.success('User found!');
      }
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

  const handleAddMemberToList = () => {
    if (searchedUser) {
      setSelectedMembers([...selectedMembers, searchedUser]);
      toast.success(`${searchedUser.name} added to team`);
      setMemberEmail('');
      setSearchedUser(null);
    }
  };

  const handleRemoveMemberFromList = (userId: string) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== userId));
    toast.success('Member removed from list');
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedTeam) return;
    
    try {
      await teamsAPI.addMember(selectedTeam.id, { 
        userId, 
        role: 'member',
      });
      toast.success('Member added successfully!');
      mutate();
      setShowAddMemberModal(false);
      setMemberEmail('');
      setSearchedUser(null);
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold gradient-text">Teams</h1>
            <p className="text-gray-700 mt-1">Create and manage collaboration teams</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="w-full md:w-auto">
            <Plus size={20} />
            New Team
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team: any) => (
            <Card
              key={team.id}
              className="space-y-4"
              onClick={() => navigate(`/teams/${team.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800">{team.name}</h3>
                  {team.description && (
                    <p className="text-gray-600 text-sm mt-1">{team.description}</p>
                  )}
                </div>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeleteTeam(team.id);
                  }}
                  className="p-2 rounded-lg bg-red-500/20 text-red-600 hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Members</span>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedTeam(team);
                      setShowAddMemberModal(true);
                    }}
                    className="flex items-center gap-1 text-pastel-mint hover:text-pastel-sky font-medium"
                  >
                    <UserPlus size={14} />
                    Add
                  </button>
                </div>

                <div className="space-y-1">
                  {team.members?.map((member: any) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pastel-mint to-pastel-lavender flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {member.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{member.user.name}</p>
                          {member.role === 'admin' && (
                            <span className="flex items-center gap-1 text-xs text-yellow-600">
                              <Crown size={10} />
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                      {member.role !== 'admin' && (
                        <button
                          onClick={() => handleRemoveMember(team.id, member.userId)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center gap-4 text-xs text-gray-500">
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
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No teams yet</h3>
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

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          reset();
          setSelectedMembers([]);
          setMemberEmail('');
          setSearchedUser(null);
        }}
        title="Create New Team"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Team Name"
            {...register('name')}
            placeholder="Enter team name"
            error={errors.name?.message}
          />

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Description (Optional)
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Enter team description"
              className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pastel-mint transition-all"
            />
          </div>

          {/* Add Members Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Add Members (Optional)
            </label>
            
            {/* Selected Members List */}
            {selectedMembers.length > 0 && (
              <div className="mb-3 space-y-2 max-h-32 overflow-y-auto border-2 border-gray-200 rounded-2xl p-2">
                {selectedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 bg-pastel-mint/20 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pastel-mint to-pastel-lavender flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{member.name}</p>
                        <p className="text-xs text-gray-600">{member.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMemberFromList(member.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Email Search */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="email"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    placeholder="Enter member email"
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
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pastel-mint to-pastel-lavender flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {searchedUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{searchedUser.name}</p>
                      <p className="text-xs text-gray-600">{searchedUser.email}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddMemberToList}
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
              )}

              <p className="text-xs text-gray-600 font-medium">
                💡 Enter complete email to search and add members
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Creating...' : 'Create Team'}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setSelectedMembers([]);
              }}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showAddMemberModal}
        onClose={() => {
          setShowAddMemberModal(false);
          setMemberEmail('');
          setSearchedUser(null);
        }}
        title="Add Team Member"
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="Enter member email"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchUser())}
              />
            </div>
            <Button
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
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 border-2 border-gray-200 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pastel-mint to-pastel-lavender flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {searchedUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{searchedUser.name}</p>
                  <p className="text-sm text-gray-500">{searchedUser.email}</p>
                </div>
              </div>

              <Button
                onClick={() => handleAddMember(searchedUser.id)}
                className="w-full"
              >
                Add Member
              </Button>
            </div>
          )}

          <p className="text-xs text-gray-600 font-medium">
            💡 Enter complete email address to search for a user
          </p>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
