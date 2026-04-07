import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../../pages/auth/Login';
import RoleRedirect from './RoleRedirect';
import Unauthorized from '../../pages/auth/Unauthorized';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../../pages/admin/AdminLayout';
import AdminDashboard from '../../pages/admin/dashboard/AdminDashboard';
import ChangePassword from '../../pages/auth/ChangePassword';
import SuperAdminLayout from '../../pages/superadmin/SuperAdminLayout';
import RoleManagement from '../../pages/superadmin/RoleManagement';
import CompanyManagement from '../../pages/superadmin/CompanyManagement';
import UserManagement from '../../pages/superadmin/UserManagement';
import OperatorWorkspaceLayout from '../../pages/operator/OperatorWorkspaceLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RoleRedirect />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '/change-password',
    element: <ChangePassword />,
  },

  // Super admin routes
  {
    element: <ProtectedRoute allowedRoles={['superadmin']} />,
    children: [
      {
        path: '/superadmin',
        element: <SuperAdminLayout />,
        children: [
          {
            path: '',
            element: <RoleManagement />,
          },
          {
            path: 'roles',
            element: <RoleManagement />,
          },
          {
            path: 'users',
            element: <UserManagement />,
          },
          {
            path: 'companies',
            element: <CompanyManagement />,
          },
        ],
      },
    ],
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
            element: <Navigate to="/admin/dashboard" replace />,
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
        element: <OperatorWorkspaceLayout />,
        children: [
          {
            path: '',
            element: <AdminDashboard />,
          },
          {
            path: 'workspace',
            element: <AdminDashboard />,
          },
        ],
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
