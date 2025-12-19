import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';
import prisma from '../config/database';

const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100),
  description: z.string().optional(),
});

const addMemberSchema = z.object({
  userId: z.string(),
  role: z.enum(['admin', 'member']).default('member'),
});

export class TeamController {
  /**
   * Create new team
   */
  createTeam = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const validatedData = createTeamSchema.parse(req.body);

      const team = await prisma.team.create({
        data: {
          ...validatedData,
          creatorId: req.user!.userId,
          members: {
            create: {
              userId: req.user!.userId,
              role: 'admin',
            },
          },
        },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          members: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      res.status(201).json({ success: true, data: team });
    } catch (error) {
      console.error('❌ Create team error:', error);
      if (error instanceof Error && 'name' in error && error.name === 'ZodError') {
        res.status(400).json({ success: false, message: (error as any).errors[0].message });
      } else {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  };

  /**
   * Get all teams for current user
   */
  getTeams = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const teams = await prisma.team.findMany({
        where: {
          members: {
            some: {
              userId: req.user!.userId,
            },
          },
        },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          members: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          _count: {
            select: { tasks: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ success: true, data: teams });
    } catch (error) {
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  /**
   * Get team by ID
   */
  getTeamById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const team = await prisma.team.findUnique({
        where: { id: req.params.id },
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
              assignees: {
                include: {
                  user: { select: { id: true, name: true, email: true } },
                },
              },
            },
          },
        },
      });

      if (!team) {
        res.status(404).json({ success: false, message: 'Team not found' });
        return;
      }

      // Check if user is a member
      const isMember = team.members.some(m => m.userId === req.user!.userId);
      if (!isMember) {
        res.status(403).json({ success: false, message: 'Unauthorized' });
        return;
      }

      res.status(200).json({ success: true, data: team });
    } catch (error) {
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  /**
   * Add member to team
   */
  addMember = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const validatedData = addMemberSchema.parse(req.body);

      // Check if user is admin of the team
      const teamMember = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: req.params.id,
            userId: req.user!.userId,
          },
        },
      });

      if (!teamMember || teamMember.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Only team admins can add members' });
        return;
      }

      const member = await prisma.teamMember.create({
        data: {
          teamId: req.params.id,
          userId: validatedData.userId,
          role: validatedData.role,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });

      res.status(201).json({ success: true, data: member });
    } catch (error) {
      console.error('❌ Add member error:', error);
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  /**
   * Remove member from team
   */
  removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Check if user is admin of the team
      const teamMember = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: req.params.id,
            userId: req.user!.userId,
          },
        },
      });

      if (!teamMember || teamMember.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Only team admins can remove members' });
        return;
      }

      await prisma.teamMember.delete({
        where: {
          teamId_userId: {
            teamId: req.params.id,
            userId: req.params.userId,
          },
        },
      });

      res.status(200).json({ success: true, message: 'Member removed' });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  /**
   * Delete team
   */
  deleteTeam = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const team = await prisma.team.findUnique({
        where: { id: req.params.id },
      });

      if (!team) {
        res.status(404).json({ success: false, message: 'Team not found' });
        return;
      }

      if (team.creatorId !== req.user!.userId) {
        res.status(403).json({ success: false, message: 'Only team creator can delete the team' });
        return;
      }

      await prisma.team.delete({
        where: { id: req.params.id },
      });

      res.status(200).json({ success: true, message: 'Team deleted' });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };
}
