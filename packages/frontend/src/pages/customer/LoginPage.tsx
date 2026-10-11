import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, devLoginSchema, LoginInput, DevLoginInput } from '@mk-drycleaners/shared';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Sparkles, Key } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, devLogin, isLoading, error } = useAuth();
  const [isDevMode, setIsDevMode] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      mobile: '',
      password: '',
    },
  });

  const devForm = useForm<DevLoginInput>({
    resolver: zodResolver(devLoginSchema),
    defaultValues: {
      mobile: '9000000001',
      devKey: 'dev-secret-key-1234',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const res = await login(data);
      const role = res.data.user.role;
      if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'DELIVERY_PARTNER') {
        navigate('/partner');
      } else {
        navigate('/');
      }
    } catch (e) {
      // handled by useAuth
    }
  };

  const onDevSubmit = async (data: DevLoginInput) => {
    try {
      const res = await devLogin(data);
      const role = res.data.user.role;
      if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'DELIVERY_PARTNER') {
        navigate('/partner');
      } else {
        navigate('/');
      }
    } catch (e) {
      // handled by useAuth
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-primary text-white mb-2 shadow-md">
            <Sparkles className="w-6 h-6 text-accent" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome Back</h2>
          <p className="text-sm text-slate-500">
            Sign in to access your orders, scheduled pickups, and addresses.
          </p>
        </div>

        {error && <Alert type="danger">{error}</Alert>}

        {!isDevMode ? (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Mobile Number"
              placeholder="e.g. 9876543210"
              maxLength={10}
              {...form.register('mobile')}
              error={form.formState.errors.mobile?.message}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              {...form.register('password')}
              error={form.formState.errors.password?.message}
            />

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
              Sign In
            </Button>
          </form>
        ) : (
          <form onSubmit={devForm.handleSubmit(onDevSubmit)} className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
              <Key className="w-4 h-4 flex-shrink-0" />
              <span>Dev Login active (Bypasses password using dev master key)</span>
            </div>

            <Input
              label="Mobile Number"
              placeholder="9000000001 (Admin) or 9000000003 (Customer)"
              {...devForm.register('mobile')}
              error={devForm.formState.errors.mobile?.message}
            />

            <Input
              label="Dev Key"
              type="password"
              placeholder="dev-secret-key-1234"
              {...devForm.register('devKey')}
              error={devForm.formState.errors.devKey?.message}
            />

            <Button type="submit" variant="secondary" className="w-full mt-2" isLoading={isLoading}>
              Dev Sign In
            </Button>
          </form>
        )}

        <div className="pt-2 flex flex-col items-center gap-3 text-sm">
          <div>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsDevMode(!isDevMode)}
            className="text-xs text-slate-400 hover:text-slate-600 underline"
          >
            {isDevMode ? 'Switch to Standard Login' : 'Developer Fast Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
