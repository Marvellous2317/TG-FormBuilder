import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/store/authStore';
import Loader from '../../shared/components/Loader';

export default function RoleRedirect() {
  const { accessToken, user, requiresPasswordChange, hasHydrated } =
    useAuthStore();

  if (!hasHydrated) {
    return <Loader size="h-20 w-20 !border-primary-200" />;
  }

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiresPasswordChange) {
    return <Navigate to="/change-password" replace />;
  }

  switch (user?.role?.roleName?.toLowerCase()) {
    case 'superadmin':
      return <Navigate to="/superadmin/" replace />;
    case 'admin':
      return <Navigate to="/admin/" replace />;
    case 'operator':
      return <Navigate to="/operator/" replace />;
    case 'approver':
      return <Navigate to="/approver/" replace />;
    case 'approval':
      return <Navigate to="/approver/" replace />;
    default:
      return <Navigate to="/custom" replace />;
  }
}
