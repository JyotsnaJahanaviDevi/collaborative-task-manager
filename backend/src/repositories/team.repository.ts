import prisma from '../config/database';

export class TeamRepository {
  async create(data: { name: string; description?: string; creatorId: string; memberIds?: string[] }) {
    const { memberIds, ...teamData } = data;
    
    // Create team with only creator as admin
    const team = await prisma.team.create({
      data: {
        ...teamData,
        members: {
          create: [{ userId: data.creatorId, role: 'admin' }],
        },
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
    });

    // Directly add provided members to the team
    if (memberIds && memberIds.length > 0) {
      for (const userId of memberIds) {
        await prisma.teamMember.create({
          data: {
            teamId: team.id,
            userId,
            role: 'member',
          },
        });
      }
    }

    return team;
  }

  async findAll(userId?: string) {
    return prisma.team.findMany({
      where: userId ? {
        members: { some: { userId } },
      } : undefined,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.team.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        tasks: {
          include: {
            creator: { select: { id: true, name: true, email: true } },
            assignedTo: { select: { id: true, name: true, email: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
    });
  }

  async update(id: string, data: { name?: string; description?: string }) {
    return prisma.team.update({
      where: { id },
      data,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
    });
  }

  async delete(id: string) {
    return prisma.team.delete({ where: { id } });
  }

  async addMember(teamId: string, userId: string, role: string = 'member') {
    return prisma.teamMember.create({
      data: { teamId, userId, role },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async createInvitation(teamId: string, userId: string, invitedBy: string, message?: string) {
    return prisma.teamInvitation.create({
      data: { teamId, userId, invitedBy, message },
      include: {
        team: { select: { id: true, name: true, description: true } },
        inviter: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async getInvitation(id: string) {
    return prisma.teamInvitation.findUnique({
      where: { id },
      include: {
        team: { select: { id: true, name: true, description: true } },
        inviter: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async getUserInvitations(userId: string) {
    return prisma.teamInvitation.findMany({
      where: { userId, status: 'PENDING' },
      include: {
        team: { select: { id: true, name: true, description: true } },
        inviter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateInvitationStatus(id: string, status: 'ACCEPTED' | 'REJECTED') {
    return prisma.teamInvitation.update({
      where: { id },
      data: { status },
    });
  }

  async removeMember(teamId: string, userId: string) {
    return prisma.teamMember.deleteMany({
      where: { teamId, userId },
    });
  }

  async isMember(teamId: string, userId: string) {
    const member = await prisma.teamMember.findFirst({
      where: { teamId, userId },
    });
    return !!member;
  }

  async isAdmin(teamId: string, userId: string) {
    const member = await prisma.teamMember.findFirst({
      where: { teamId, userId, role: 'admin' },
    });
    return !!member;
  }
}
