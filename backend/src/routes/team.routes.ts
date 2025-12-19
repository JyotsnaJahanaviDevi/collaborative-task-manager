import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const teamController = new TeamController();

// All routes require authentication
router.use(authenticate);

// Team routes
router.post('/', teamController.createTeam);
router.get('/', teamController.getTeams);
router.get('/:id', teamController.getTeamById);
router.delete('/:id', teamController.deleteTeam);

// Member management
router.post('/:id/members', teamController.addMember);
router.delete('/:id/members/:userId', teamController.removeMember);

export default router;
