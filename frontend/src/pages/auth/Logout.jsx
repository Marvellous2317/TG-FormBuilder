import React, { useEffect } from 'react';
import { useAuthStore } from '../../shared/store/authStore';
import RoleRedirect from '../../core/router/RoleRedirect';

export default function Logout() {
  const { clearAuth } = useAuthStore();

  useEffect(() => {
    clearAuth();
  }, []);

  return <RoleRedirect />;
}
