import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../shared/store/authStore';
import Loader from '../../shared/components/Loader';

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();

  const isLoading = false;

  if (isLoading) {
    return <Loader size="h-20 w-20 !border-primary-200" />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role.roleName.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
