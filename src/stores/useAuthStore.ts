import { create } from 'zustand';
import { authService } from '../services/authService';

export interface User {
  _id: string;
  username: string;
  role: 'admin' | 'staff' | 'user';
  pic?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => void;
  setError: (error: string | null) => void;
}

const TOKEN_KEY = '@swamys_token';
const USER_KEY = '@swamys_user';

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (username: string, password: string) => {
    try {
      set({ error: null });
      const response = await authService.login(username, password);

      // Store token and user
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        error: null,
      });
    } catch (err: any) {
      set({ error: err.message || 'Login failed' });
      throw err;
    }
  },

  logout: async () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
  },

  loadToken: () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);

      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.error('Load token error:', err);
      set({ isLoading: false });
    }
  },

  setError: (error) => set({ error }),
}));
