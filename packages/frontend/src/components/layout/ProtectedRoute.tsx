import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { RoleType } from '@mk-drycleaners/shared';

interface ProtectedRouteProps {
  allowedRoles?: RoleType[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role as RoleType)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
