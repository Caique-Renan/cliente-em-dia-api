import { api } from './api';
import type { 
  MessageTemplate, 
  MessageLog, 
  PreviewMessageRequest, 
  PreviewMessageResponse, 
  CreateMessageLogRequest 
} from '../types/message';

export const messagesService = {
  listTemplates: async () => {
    const response = await api.get<{ data: MessageTemplate[] }>('/message-templates');
    return response.data;
  },

  getTemplate: async (id: string) => {
    const response = await api.get<MessageTemplate>(`/message-templates/${id}`);
    return response.data;
  },

  createTemplate: async (data: Partial<MessageTemplate>) => {
    const response = await api.post<MessageTemplate>('/message-templates', data);
    return response.data;
  },

  updateTemplate: async (id: string, data: Partial<MessageTemplate>) => {
    const response = await api.patch<MessageTemplate>(`/message-templates/${id}`, data);
    return response.data;
  },

  updateTemplateStatus: async (id: string, isActive: boolean) => {
    const response = await api.patch<MessageTemplate>(`/message-templates/${id}/status`, { isActive });
    return response.data;
  },

  previewMessage: async (data: PreviewMessageRequest) => {
    const response = await api.post<PreviewMessageResponse>('/message-templates/preview', data);
    return response.data;
  },

  createLog: async (data: CreateMessageLogRequest) => {
    const response = await api.post<MessageLog>('/message-logs', data);
    return response.data;
  }
};
