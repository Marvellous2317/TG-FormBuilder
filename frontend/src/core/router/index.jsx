import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../../pages/auth/Login';
import RoleRedirect from './RoleRedirect';
import Unauthorized from '../../pages/auth/Unauthorized';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../../pages/admin/AdminLayout';
import AdminDashboard from '../../pages/admin/dashboard/AdminDashboard';
import ChangePassword from '../../pages/auth/ChangePassword';
import SuperAdminLayout from '../../pages/superadmin/SuperAdminLayout';
import RoleManagement from '../../pages/superadmin/roles/RoleManagement';
import CompanyManagement from '../../pages/superadmin/company/CompanyManagement';
import UserManagement from '../../pages/superadmin/users/UserManagement';
import OperatorWorkspaceLayout from '../../pages/operator/OperatorWorkspaceLayout';
import AdminSettings from '../../pages/admin/settings/AdminSettings';
import AdminUserManagement from '../../pages/admin/users/AdminUserManagement';
import DepartmentManagement from '../../pages/superadmin/departments/DepartmentManagement';
import AuthProtect from './AuthProtect';
import ForgotPassword from '../../pages/auth/ForgotPassword';
import SuperAdminDashboard from '../../pages/superadmin/dashboard/SuperAdminDashboard';

export const router = createBrowserRouter([
  {
    element: <AuthProtect />,
    children: [
      {
        path: '',
        children: [
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
          {
            path: '/forgot-password',
            element: <ForgotPassword />,
          },
          {
            path: '/reset-password',
            element: <ChangePassword />,
          },
        ],
      },
    ],
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
            element: <SuperAdminDashboard />,
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
            path: 'departments',
            element: <DepartmentManagement />,
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
            element: <AdminDashboard />,
          },
          {
            path: 'users',
            element: <AdminUserManagement />,
          },
          {
            path: 'settings',
            element: <AdminSettings />,
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
