import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../shared/store/authStore';

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  const isLoading = false;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    clearAuth();
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role.roleName.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
