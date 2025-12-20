export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  user: User;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
  creatorId: string;
  creator?: User;
  assignedTo?: User | null;
  assignedToId?: string | null;
  teamId?: string | null;
  assignees?: TaskAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Notification {
  id: string;
  message: string;
  taskId: string;
  read: boolean;
  createdAt: string;
}
