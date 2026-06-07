import { create } from 'zustand';
import api from '@/lib/axios';
import Cookies from 'js-cookie';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'Admin' | 'Employer' | 'Usher';
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: (token, refreshToken, user) => {
    Cookies.set('access_token', token);
    Cookies.set('refresh_token', refreshToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },
  logout: () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  fetchUser: async () => {
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const res = await api.get('/users/me');
      set({ user: res.data.data, isAuthenticated: true, isLoading: false });
    } catch {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
