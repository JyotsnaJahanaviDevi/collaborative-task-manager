import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const teamController = new TeamController();

router.post('/', authenticate, teamController.createTeam);
router.get('/', authenticate, teamController.getTeams);
router.get('/:id', authenticate, teamController.getTeam);
router.put('/:id', authenticate, teamController.updateTeam);
router.delete('/:id', authenticate, teamController.deleteTeam);
router.post('/:id/members', authenticate, teamController.addMember);
router.delete('/:id/members/:userId', authenticate, teamController.removeMember);

export default router;
