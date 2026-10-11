import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, UpdateProfileInput } from '@mk-drycleaners/shared';
import { useFetch, useMutate } from '../../hooks/useApi';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { data: profile, isLoading } = useFetch<any>(['userProfile'], '/users/profile');

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.customerProfile?.firstName || profile.partnerProfile?.firstName || '',
        lastName: profile.customerProfile?.lastName || profile.partnerProfile?.lastName || '',
        email: profile.email || '',
      });
    }
  }, [profile, form]);

  const updateMutation = useMutate(
    async (values: UpdateProfileInput) => {
      const res = await api.patch('/users/profile', values);
      return res.data;
    },
    [['userProfile']]
  );

  const onSubmit = (values: UpdateProfileInput) => {
    updateMutation.mutate(values, {
      onSuccess: () => toast.success('Profile updated successfully'),
      onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update profile'),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader title="My Profile" description="Manage your contact details and preferences" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="text-slate-400 block text-xs">Registered Mobile</span>
              <span className="font-semibold text-slate-800">{profile?.mobile}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Account Role</span>
              <span className="font-semibold text-slate-800">{profile?.role}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Status</span>
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                Active
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  {...form.register('firstName')}
                  error={form.formState.errors.firstName?.message}
                />
                <Input
                  label="Last Name"
                  {...form.register('lastName')}
                  error={form.formState.errors.lastName?.message}
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                {...form.register('email')}
                error={form.formState.errors.email?.message}
              />

              <div className="pt-2">
                <Button type="submit" variant="primary" isLoading={updateMutation.isPending}>
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
