import React from 'react';
import { Navigate } from 'react-router-dom';

export default function RoleRedirect() {
  const isAuthenticated = true;

  const user = {
    name: 'John Doe',
    role: 'superadmin',
  };

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'superadmin':
      return <Navigate to="/superadmin/roles" replace />;
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'operator':
      return <Navigate to="/operator/workspace" replace />;
    case 'approver':
      return <Navigate to="/approver/queue" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}
