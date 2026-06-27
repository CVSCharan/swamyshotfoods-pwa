import { apiClient } from './api';

interface LoginResponse {
  token: string;
  user: {
    _id: string;
    username: string;
    role: 'admin' | 'staff' | 'user';
  };
}

interface RegisterData {
  username: string;
  password: string;
  role?: 'admin' | 'staff' | 'user';
  pic?: string;
}

export const authService = {
  login: async (username: string, password: string) => {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        username,
        password,
      });
      return response;
    } catch (error) {
      console.error('❌ Login API error:', error);
      throw error;
    }
  },

  register: (data: RegisterData) => {
    return apiClient.post<LoginResponse>('/auth/register', data);
  },
};
