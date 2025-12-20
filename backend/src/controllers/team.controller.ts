import { Response } from 'express';
import { TeamService } from '../services/team.service';
import { createTeamSchema, updateTeamSchema, addMemberSchema } from '../dtos/team.dto';
import { AuthRequest } from '../middleware/auth.middleware';

export class TeamController {
  private teamService: TeamService;

  constructor() {
    this.teamService = new TeamService();
  }

  createTeam = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const validatedData = createTeamSchema.parse(req.body);
      const result = await this.teamService.createTeam(validatedData, req.user!.userId);

      const io = req.app.get('io');
      io.emit('team-created', result.team);

      res.status(201).json({ success: true, data: result.team });
    } catch (error) {
      if (error instanceof Error && 'name' in error && error.name === 'ZodError') {
        res.status(400).json({ success: false, message: (error as any).errors[0].message });
      } else {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  };

  getTeams = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const teams = await this.teamService.getTeams(req.user!.userId);
      res.status(200).json({ success: true, data: teams });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  getTeam = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const team = await this.teamService.getTeamById(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, data: team });
    } catch (error) {
      if (error instanceof Error && error.message === 'Team not found') {
        res.status(404).json({ success: false, message: error.message });
      } else if (error instanceof Error && error.message.includes('not a member')) {
        res.status(403).json({ success: false, message: error.message });
      } else {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  };

  updateTeam = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const validatedData = updateTeamSchema.parse(req.body);
      const team = await this.teamService.updateTeam(req.params.id, validatedData, req.user!.userId);

      const io = req.app.get('io');
      io.emit('team-updated', team);

      res.status(200).json({ success: true, data: team });
    } catch (error) {
      if (error instanceof Error && error.message.includes('admin')) {
        res.status(403).json({ success: false, message: error.message });
      } else {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  };

  deleteTeam = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await this.teamService.deleteTeam(req.params.id, req.user!.userId);

      const io = req.app.get('io');
      io.emit('team-deleted', req.params.id);

      res.status(200).json({ success: true, message: 'Team deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Team not found') {
        res.status(404).json({ success: false, message: error.message });
      } else if (error instanceof Error && error.message.includes('creator')) {
        res.status(403).json({ success: false, message: error.message });
      } else {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  };

  addMember = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const validatedData = addMemberSchema.parse(req.body);
      const member = await this.teamService.addMember(
        req.params.id,
        validatedData.userId,
        req.user!.userId,
        validatedData.role
      );

      const io = req.app.get('io');
      io.emit('team-updated', { teamId: req.params.id });

      res.status(201).json({ success: true, data: member, message: 'Member added successfully' });
    } catch (error) {
      if (error instanceof Error && error.message.includes('admin')) {
        res.status(403).json({ success: false, message: error.message });
      } else {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  };

  removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await this.teamService.removeMember(req.params.id, req.params.userId, req.user!.userId);

      const io = req.app.get('io');
      io.to(`user:${req.params.userId}`).emit('team-removed', {
        teamId: req.params.id,
      });

      res.status(200).json({ success: true, message: 'Member removed successfully' });
    } catch (error) {
      if (error instanceof Error && error.message.includes('admin')) {
        res.status(403).json({ success: false, message: error.message });
      } else {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  };
}
