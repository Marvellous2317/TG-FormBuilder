import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/store/authStore';

export default function RoleRedirect() {
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  if (!isAuthenticated || !user) {
    clearAuth();
    return <Navigate to="/login" replace />;
  }

  switch (user.role.roleName.toLowerCase()) {
    case 'superadmin':
      return <Navigate to="/superadmin/" replace />;
    case 'admin':
      return <Navigate to="/admin/" replace />;
    case 'operator':
      return <Navigate to="/operator/" replace />;
    case 'approver':
      return <Navigate to="/approver/" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
}
