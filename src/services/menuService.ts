import { apiClient } from './api';
import type { MenuItem } from '../stores/useMenuStore';

export const menuService = {
  getAll: () => apiClient.get<MenuItem[]>('/menu'),
  getById: (id: string) => apiClient.get<MenuItem>(`/menu/${id}`),
  create: (data: Partial<MenuItem>) => apiClient.post<MenuItem>('/menu', data),
  update: (id: string, data: Partial<MenuItem>) =>
    apiClient.put<MenuItem>(`/menu/${id}`, data),
  delete: (id: string) => apiClient.delete(`/menu/${id}`),
};
