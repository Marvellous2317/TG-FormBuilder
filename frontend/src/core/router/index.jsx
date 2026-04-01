import { createBrowserRouter } from 'react-router-dom';
import Login from '../../pages/auth/Login';
import RoleRedirect from './RoleRedirect';
import Unauthorized from '../../pages/auth/Unauthorized';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../../pages/admin/AdminLayout';
import AdminDashboard from '../../pages/admin/dashboard/AdminDashboard';
import ChangePassword from '../../pages/auth/ChangePassword';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <RoleRedirect />,
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '/change-password',
    element: <ChangePassword />,
  },

  // Admin routes
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          {
            path: '',
            element: <AdminDashboard />,
          },
          {
            path: 'dashboard',
            element: <AdminDashboard />,
          },
        ],
      },
    ],
  },

  // Operator routes
  {
    element: <ProtectedRoute allowedRoles={['operator']} />,
    children: [
      {
        path: '/operator',
        element: <div>Operator Workspace</div>,
      },
    ],
  },

  // Approver routes
  {
    element: <ProtectedRoute allowedRoles={['approver']} />,
    children: [
      {
        path: '/approver',
        element: <div>Approver Queue</div>,
      },
    ],
  },
]);
