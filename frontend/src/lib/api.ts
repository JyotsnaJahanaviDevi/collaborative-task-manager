import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: { name: string; email: string; password: string }) => {
    const response = await api.post<{ success: boolean; data: any; token: string }>('/auth/register', data);
    return { user: response.data.data, token: response.data.token };
  },
  
  login: async (data: { email: string; password: string }) => {
    const response = await api.post<{ success: boolean; data: any; token: string }>('/auth/login', data);
    return { user: response.data.data, token: response.data.token };
  },
  
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data.data;
  },
  
  updateProfile: async (data: { name: string }) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  searchByEmail: async (email: string) => {
    const response = await api.get('/users/search', { params: { email } });
    return response.data;
  },
  
  deleteAccount: async () => {
    const response = await api.delete('/users/profile');
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (filters?: { status?: string; priority?: string; sortBy?: string; teamId?: string }) => {
    const response = await api.get('/tasks', { params: filters });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/tasks', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
  
  getMyTasks: async () => {
    const response = await api.get('/tasks/my/assigned');
    return response.data;
  },
  
  getCreatedTasks: async () => {
    const response = await api.get('/tasks/my/created');
    return response.data;
  },
  
  getOverdueTasks: async () => {
    const response = await api.get('/tasks/overdue');
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/tasks/dashboard');
    return response.data;
  },
};

// Teams API
export const teamsAPI = {
  getAll: async () => {
    const response = await api.get('/teams');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  create: async (data: { name: string; description?: string; memberIds?: string[] }) => {
    const response = await api.post('/teams', data);
    return response.data;
  },

  update: async (id: string, data: { name?: string; description?: string }) => {
    const response = await api.put(`/teams/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/teams/${id}`);
    return response.data;
  },

  addMember: async (teamId: string, data: { userId: string; role?: string }) => {
    const response = await api.post(`/teams/${teamId}/members`, data);
    return response.data;
  },

  removeMember: async (teamId: string, userId: string) => {
    const response = await api.delete(`/teams/${teamId}/members/${userId}`);
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  clearAll: async () => {
    const response = await api.delete('/notifications');
    return response.data;
  },
};
