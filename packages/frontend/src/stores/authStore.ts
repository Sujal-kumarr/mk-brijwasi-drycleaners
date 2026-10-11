import { create } from 'zustand';
import { AuthUser } from '@mk-drycleaners/shared';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
  setTokens: (accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: localStorage.getItem('mk_user') ? JSON.parse(localStorage.getItem('mk_user')!) : null,
  accessToken: localStorage.getItem('mk_access_token') || null,
  isAuthenticated: !!localStorage.getItem('mk_access_token'),
  isLoading: false,

  setAuth: (user: AuthUser, accessToken: string) => {
    localStorage.setItem('mk_user', JSON.stringify(user));
    localStorage.setItem('mk_access_token', accessToken);
    set({ user, accessToken, isAuthenticated: true });
  },

  setTokens: (accessToken: string) => {
    localStorage.setItem('mk_access_token', accessToken);
    set({ accessToken, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem('mk_user');
    localStorage.removeItem('mk_access_token');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
