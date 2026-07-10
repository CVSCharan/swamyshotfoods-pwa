import { apiClient } from './api';
import type { MenuItem } from '../stores/useMenuStore';

export interface TimingTemplate {
  _id: string;
  name: string;
  key: string;
  isActive: boolean;
  morningTimings?: { startTime: string; endTime: string };
  eveningTimings?: { startTime: string; endTime: string };
}

export const menuService = {
  getAll: () => apiClient.get<MenuItem[]>('/menu'),
  getById: (id: string) => apiClient.get<MenuItem>(`/menu/${id}`),
  create: (data: Partial<MenuItem>) => apiClient.post<MenuItem>('/menu', data),
  update: (id: string, data: Partial<MenuItem>) =>
    apiClient.put<MenuItem>(`/menu/${id}`, data),
  delete: (id: string) => apiClient.delete(`/menu/${id}`),
  assignTemplate: (id: string, data: { templateId: string }) => 
    apiClient.put<MenuItem>(`/menu/${id}/assign-template`, data),
  bulkAssignTemplate: (data: { itemIds: string[]; templateId: string }) =>
    apiClient.post<any>('/menu/bulk-assign-template', data),
  setCustomTimings: (id: string, data: { morningTimings?: any; eveningTimings?: any }) =>
    apiClient.put<MenuItem>(`/menu/${id}/custom-timings`, data),
  getAvailableNow: () => apiClient.get<MenuItem[]>('/menu/available/now'),
  getByTimeSlot: (slot: 'morning' | 'evening') => 
    apiClient.get<MenuItem[]>(`/menu/available/${slot}`),

  getTimingTemplates: () => apiClient.get<TimingTemplate[]>('/admin/timing-templates'),
  createTimingTemplate: (data: Partial<TimingTemplate>) => 
    apiClient.post<TimingTemplate>('/admin/timing-templates', data),
  updateTimingTemplate: (id: string, data: Partial<TimingTemplate>) =>
    apiClient.put<TimingTemplate>(`/admin/timing-templates/${id}`, data),
  deleteTimingTemplate: (id: string) => 
    apiClient.delete(`/admin/timing-templates/${id}`),
};
