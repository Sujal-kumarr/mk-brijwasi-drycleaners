import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@mk-drycleaners/shared';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Sparkles } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error } = useAuth();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      mobile: '',
      email: '',
      password: '',
      role: 'CUSTOMER',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      await registerUser(data);
      navigate('/');
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create Account</h2>
          <p className="text-sm text-slate-500">
            Join MK Brijwasi Drycleaners for seamless pickup and delivery.
          </p>
        </div>

        {error && <Alert type="danger">{error}</Alert>}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              placeholder="e.g. Rahul"
              {...form.register('firstName')}
              error={form.formState.errors.firstName?.message}
            />
            <Input
              label="Last Name"
              placeholder="e.g. Sharma"
              {...form.register('lastName')}
              error={form.formState.errors.lastName?.message}
            />
          </div>

          <Input
            label="Mobile Number"
            placeholder="10-digit mobile"
            maxLength={10}
            {...form.register('mobile')}
            error={form.formState.errors.mobile?.message}
          />

          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="rahul@example.com"
            {...form.register('email')}
            error={form.formState.errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            {...form.register('password')}
            error={form.formState.errors.password?.message}
          />

          <Button type="submit" variant="primary" className="w-full mt-4" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className="text-center text-sm text-slate-500 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
