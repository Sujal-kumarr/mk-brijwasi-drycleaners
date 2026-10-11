import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import { LoginInput, RegisterInput, DevLoginInput } from '@mk-drycleaners/shared';

export function useAuth() {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (input: LoginInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', input);
      const { user: userData, tokens } = response.data.data;
      setAuth(userData, tokens.accessToken);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to login';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const devLogin = async (input: DevLoginInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/dev-login', input);
      const { user: userData, tokens } = response.data.data;
      setAuth(userData, tokens.accessToken);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to dev login';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (input: RegisterInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', input);
      const { user: userData, tokens } = response.data.data;
      setAuth(userData, tokens.accessToken);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to register';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      clearAuth();
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    devLogin,
    register,
    logout,
  };
}
