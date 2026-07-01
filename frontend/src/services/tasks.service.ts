import { api } from './api';
import type { Task, TaskStatus } from '../types/task';

interface FetchTasksParams {
  search?: string;
  customerId?: string;
  attendanceId?: string;
  status?: string;
  type?: string;
  priority?: string;
  assignedToId?: string;
  dueFrom?: string;
  dueTo?: string;
  onlyOverdue?: boolean;
  page?: number;
  limit?: number;
}

interface TasksResponse {
  data: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const tasksService = {
  async fetchTasks(params?: FetchTasksParams): Promise<TasksResponse> {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  async getTaskById(id: string): Promise<Task> {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  async createTask(data: any): Promise<Task> {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  async updateTask(id: string, data: any): Promise<Task> {
    const response = await api.patch(`/tasks/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  async completeTask(id: string): Promise<Task> {
    const response = await api.patch(`/tasks/${id}/complete`);
    return response.data;
  },
};
