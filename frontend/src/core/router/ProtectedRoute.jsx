import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../shared/store/authStore';
import Loader from '../../shared/components/Loader';

export default function ProtectedRoute() {
  const { accessToken, user, hasHydrated } = useAuthStore();

  if (!hasHydrated) {
    return <Loader size="h-20 w-20 !border-primary-200" />;
  }

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  // if (!allowedRoles.includes(user?.role?.roleName.toLowerCase())) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return <Outlet />;
}
