import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../../pages/auth/Login';
import RoleRedirect from './RoleRedirect';
import Unauthorized from '../../pages/auth/Unauthorized';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../../pages/admin/AdminLayout';
import AdminDashboard from '../../pages/admin/dashboard/AdminDashboard';
import ChangePassword from '../../pages/auth/ChangePassword';
import NotFound from '../../pages/auth/NotFound';
import SuperAdminLayout from '../../pages/superadmin/SuperAdminLayout';
import RoleManagement from '../../pages/superadmin/roles/RoleManagement';
import UserManagement from '../../pages/superadmin/users/UserManagement';
import OperatorWorkspaceLayout from '../../pages/operator/OperatorWorkspaceLayout';
import PendingTasks from '../../pages/operator/PendingTasks';
import ApprovedTasks from '../../pages/operator/ApprovedTasks';
import AdminUserManagement from '../../pages/admin/users/AdminUserManagement';
import DepartmentManagement from '../../pages/superadmin/departments/DepartmentManagement';
import AuthProtect from './AuthProtect';
import ForgotPassword from '../../pages/auth/ForgotPassword';
import SuperAdminDashboard from '../../pages/superadmin/dashboard/SuperAdminDashboard';
import EntitiesManagement from '../../pages/superadmin/entities/EntitiesManagement';
import Entity from '../../pages/superadmin/entities/Entity';
import OperatorDashboard from '../../pages/operator/OperatorDashboard';
import RejectedTasks from '../../pages/operator/RejectedTasks';
import Settings from '../../pages/auth/Settings';
import Logout from '../../pages/auth/Logout';
import CreateEntries from '../../pages/admin/dashboard/CreateEntries';

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
            path: '/logout',
            element: <Logout />,
          },
          {
            path: '/unauthorized',
            element: <Unauthorized />,
          },
          {
            path: '/not-found',
            element: <NotFound />,
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
            path: 'entities',
            element: <EntitiesManagement />,
          },
          {
            path: 'entities/:id',
            loader: ({ params }) => params,
            element: <Entity />,
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
            path: 'settings',
            element: <Settings />,
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
            path: 'entries/:id',
            loader: ({ params }) => params,
            element: <CreateEntries />,
          },
          {
            path: 'users',
            element: <AdminUserManagement />,
          },
          {
            path: 'settings',
            element: <Settings />,
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
            element: <OperatorDashboard />,
          },
          {
            path: 'pending',
            element: <PendingTasks />,
          },
          {
            path: 'approved',
            element: <ApprovedTasks />,
          },
          {
            path: 'rejected',
            element: <RejectedTasks />,
          },
          {
            path: 'settings',
            element: <Settings />,
          },
        ],
      },
    ],
  },

  // Approver routes
  {
    element: <ProtectedRoute allowedRoles={['approver', 'approval']} />,
    children: [
      {
        path: '/approver',
        element: <div>Approver Queue</div>,
      },
    ],
  },
]);
