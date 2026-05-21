import { Outlet, Navigate } from 'react-router-dom';
// import { useAuthStore } from '../../shared/store/authStore';
import RoleRedirect from './RoleRedirect';

const AuthProtect = () => {
  // const { isAuthenticated } = useAuthStore();

  // if (isAuthenticated) return <RoleRedirect />;

  return <Outlet />;
};

export default AuthProtect;
