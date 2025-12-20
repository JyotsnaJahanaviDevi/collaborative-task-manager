import { TeamRepository } from '../repositories/team.repository';
import { CreateTeamDto, UpdateTeamDto } from '../dtos/team.dto';

export class TeamService {
  private teamRepository: TeamRepository;

  constructor() {
    this.teamRepository = new TeamRepository();
  }

  async createTeam(data: CreateTeamDto, creatorId: string) {
    const team = await this.teamRepository.create({
      ...data,
      creatorId,
      memberIds: data.memberIds,
    });

    return { team };
  }

  async getTeams(userId?: string) {
    return this.teamRepository.findAll(userId);
  }

  async getTeamById(id: string, userId: string) {
    const team = await this.teamRepository.findById(id);
    if (!team) {
      throw new Error('Team not found');
    }

    const isMember = await this.teamRepository.isMember(id, userId);
    if (!isMember) {
      throw new Error('You are not a member of this team');
    }

    return team;
  }

  async updateTeam(id: string, data: UpdateTeamDto, userId: string) {
    const isAdmin = await this.teamRepository.isAdmin(id, userId);
    if (!isAdmin) {
      throw new Error('Only team admins can update the team');
    }

    return this.teamRepository.update(id, data);
  }

  async deleteTeam(id: string, userId: string) {
    const team = await this.teamRepository.findById(id);
    if (!team) {
      throw new Error('Team not found');
    }

    if (team.creatorId !== userId) {
      throw new Error('Only the team creator can delete the team');
    }

    return this.teamRepository.delete(id);
  }

  async addMember(teamId: string, userId: string, requesterId: string, role: string = 'member') {
    const isAdmin = await this.teamRepository.isAdmin(teamId, requesterId);
    if (!isAdmin) {
      throw new Error('Only team admins can invite members');
    }

    const isMember = await this.teamRepository.isMember(teamId, userId);
    if (isMember) {
      throw new Error('User is already a member');
    }

    return this.teamRepository.addMember(teamId, userId, role);
  }

  async removeMember(teamId: string, userId: string, requesterId: string) {
    const isAdmin = await this.teamRepository.isAdmin(teamId, requesterId);
    if (!isAdmin) {
      throw new Error('Only team admins can remove members');
    }

    const team = await this.teamRepository.findById(teamId);
    if (team?.creatorId === userId) {
      throw new Error('Cannot remove team creator');
    }

    return this.teamRepository.removeMember(teamId, userId);
  }
}
