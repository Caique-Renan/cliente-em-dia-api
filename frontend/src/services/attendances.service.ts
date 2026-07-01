import { api } from './api';
import type { 
  Attendance, 
  ListAttendancesQuery, 
  CreateAttendanceDTO, 
  UpdateAttendanceDTO, 
  UpdateAttendanceStatusDTO 
} from '../types/attendance';
import type { PaginatedResponse } from '../types/customer';

export const attendancesService = {
  async list(query?: ListAttendancesQuery): Promise<PaginatedResponse<Attendance>> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.customerId) params.append('customerId', query.customerId);
    if (query?.status) params.append('status', query.status);
    if (query?.source) params.append('source', query.source);
    if (query?.priority) params.append('priority', query.priority);

    const response = await api.get('/attendances', { params });
    return response.data;
  },

  async findById(id: string): Promise<Attendance> {
    const response = await api.get(`/attendances/${id}`);
    return response.data;
  },

  async create(data: CreateAttendanceDTO): Promise<Attendance> {
    const response = await api.post('/attendances', data);
    return response.data;
  },

  async update(id: string, data: UpdateAttendanceDTO): Promise<Attendance> {
    const response = await api.patch(`/attendances/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, data: UpdateAttendanceStatusDTO): Promise<Attendance> {
    const response = await api.patch(`/attendances/${id}/status`, data);
    return response.data;
  }
};
