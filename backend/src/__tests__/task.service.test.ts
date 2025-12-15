import { TaskService } from '../services/task.service';
import { TaskRepository } from '../repositories/task.repository';

jest.mock('../repositories/task.repository');

describe('TaskService', () => {
  let taskService: TaskService;
  let mockTaskRepository: jest.Mocked<TaskRepository>;

  beforeEach(() => {
    mockTaskRepository = new TaskRepository() as jest.Mocked<TaskRepository>;
    taskService = new TaskService();
    (taskService as any).taskRepository = mockTaskRepository;
  });

  /**
   * Test 3: Create Task - Should validate and create task
   */
  describe('createTask', () => {
    it('should create task with valid data', async () => {
      const mockTask = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        dueDate: new Date('2025-12-20'),
        priority: 'HIGH' as any,
        status: 'TODO' as any,
        creatorId: 'user1',
        assignedToId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskRepository.create.mockResolvedValue(mockTask as any);

      const result = await taskService.createTask(
        {
          title: 'Test Task',
          description: 'Test Description',
          dueDate: '2025-12-20T10:00:00Z',
          priority: 'HIGH',
        },
        'user1'
      );

      expect(mockTaskRepository.create).toHaveBeenCalled();
      expect(result.title).toBe('Test Task');
      expect(result.creatorId).toBe('user1');
    });
  });
});
