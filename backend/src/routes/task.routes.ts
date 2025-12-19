import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const taskController = new TaskController();

// All task routes require authentication
router.use(authenticate);

// Specific routes first (before generic :id route)
router.get('/dashboard', taskController.getDashboard);
router.get('/my/assigned', taskController.getMyTasks);
router.get('/my/created', taskController.getCreatedTasks);
router.get('/overdue', taskController.getOverdueTasks);

// Generic CRUD routes
router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;
