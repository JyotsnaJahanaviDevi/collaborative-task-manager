export interface User {
  id: string;
  email: string;
  name: string;
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
  assignedToId: string;
  creator?: User;
  assignedTo?: User;
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
