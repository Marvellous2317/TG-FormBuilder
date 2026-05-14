import React, { useEffect } from 'react';
import { useAuthStore } from '../../shared/store/authStore';
import RoleRedirect from '../../core/router/RoleRedirect';
import clearAllCaches from '../../lib/clearCache';

export default function Logout() {
  const { clearAuth } = useAuthStore();

  useEffect(() => {
    clearAuth();
    clearAllCaches();
  }, []);

  return <RoleRedirect />;
}
