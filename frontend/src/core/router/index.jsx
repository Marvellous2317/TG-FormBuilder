import { createBrowserRouter } from 'react-router-dom';
import Login from '../../pages/auth/Login';
import RoleRedirect from './RoleRedirect';
import Unauthorized from '../../pages/auth/Unauthorized';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../../pages/admin/AdminLayout';

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

  // Admin routes
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          {
            path: 'dashboard',
            element: <div>Admin Dashboard</div>,
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
