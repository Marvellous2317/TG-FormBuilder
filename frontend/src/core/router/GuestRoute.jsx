import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/store/authStore';
import Loader from '../../shared/components/Loader';

export default function GuestRoute({ children }) {
  const { accessToken, user, requiresPasswordChange, hasHydrated } =
    useAuthStore();

  if (!hasHydrated) {
    return <Loader size="h-20 w-20 !border-primary-200" />;
  }

  if (!accessToken || !user) {
    return children;
  }

  if (requiresPasswordChange) {
    return <Navigate to="/change-password" replace />;
  }

  return <Navigate to="/" replace />;
}
