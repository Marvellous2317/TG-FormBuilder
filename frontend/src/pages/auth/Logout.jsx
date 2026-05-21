import React, { useEffect } from 'react';
import { useAuthStore } from '../../shared/store/authStore';
import RoleRedirect from '../../core/router/RoleRedirect';
import clearAllCaches from '../../lib/clearCache';
import { useQueryClient } from '@tanstack/react-query';

export default function Logout() {
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    clearAuth();
    clearAllCaches();
    queryClient.clear();
  }, []);

  return <RoleRedirect />;
}
