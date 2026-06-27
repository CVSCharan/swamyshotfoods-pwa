import { apiClient } from './api';
import type { StoreConfig } from '../stores/useStoreConfigStore';

export const storeConfigService = {
  get: () => apiClient.get<StoreConfig>('/store-config'),
  update: (data: Partial<StoreConfig>) =>
    apiClient.put<StoreConfig>('/store-config', data),
  uploadLogo: (formData: FormData) => apiClient.upload('/upload', formData),
};
