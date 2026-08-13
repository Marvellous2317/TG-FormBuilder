import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ErrorElement } from '../../shared/components/ErrorBoundary';
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
import ViewOperatorEntries from '../../pages/operator/ViewOperatorEntries';
import CreateOperatorEntry from '../../pages/operator/CreateOperatorEntries';
import ApproverWorkspaceLayout from '../../pages/approver/ApproverWorkspaceLayout';
import ApproverDashboard from '../../pages/approver/ApproverDashboard';
import ViewApproverEntries from '../../pages/approver/ViewApproverEntries';
import ApproverApprovedTasks from '../../pages/approver/ApproverApprovedTasks';
import ApproverRejectedTasks from '../../pages/approver/ApproverRejectedTasks';
import RandomWorkspaceLayout from '../../pages/random/RandomWorkspaceLayout';
import RandomDashboard from '../../pages/random/RandomDashboard';
import ViewRandomEntries from '../../pages/random/ViewRandomEntries';
import RandomApprovedTasks from '../../pages/random/RandomApprovedTasks';
import RandomRejectedTasks from '../../pages/random/RandomRejectedTasks';
import ResetPassword from '../../pages/auth/ResetPassword';
import SubmissionsManagement from '../../pages/admin/submissions/SubmissionsManagement';
import ViewAdminEntries from '../../pages/admin/submissions/ViewAdminEntries';
import HistoryManagement from '../../pages/admin/history/HistoryManagement';
import ViewAdminEntriesHistory from '../../pages/admin/history/ViewAdminEntriesHistory';
import GuestRoute from './GuestRoute';
import SOPHome from '@/pages/sop/SOPHome';

export const router = createBrowserRouter([
  {
    element: <AuthProtect />,
    errorElement: <ErrorElement />,
    children: [
      {
        path: '',
        children: [
          {
            path: '/',
            element: <RoleRedirect />,
          },
          {
            path: '/sop',
            element: (
              <GuestRoute>
                <SOPHome />
              </GuestRoute>
            ),
          },
          {
            path: '/login',
            element: (
              <GuestRoute>
                <Login />
              </GuestRoute>
            ),
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
            element: <ResetPassword />,
          },
        ],
      },
    ],
  },

  // Super admin routes
  {
    element: <ProtectedRoute allowedRoles={['superadmin']} />,
    errorElement: <ErrorElement />,
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
    errorElement: <ErrorElement />,
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
            path: 'entries/:id/:title',
            loader: ({ params }) => params,
            element: <CreateEntries />,
          },
          {
            path: 'entries/:id/submissions',
            loader: ({ params }) => params,
            element: <SubmissionsManagement />,
          },
          {
            path: 'entries/:id/view/:submissionId',
            loader: ({ params }) => params,
            element: <ViewAdminEntries />,
          },
          {
            path: 'entries/:id/history',
            loader: ({ params }) => params,
            element: <HistoryManagement />,
          },
          {
            path: 'entries/:id/view/:versionId/history',
            loader: ({ params }) => params,
            element: <ViewAdminEntriesHistory />,
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
    errorElement: <ErrorElement />,
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
            path: 'entries/:id/create',
            loader: ({ params }) => params,
            element: <CreateOperatorEntry />,
          },
          {
            path: 'entries/:id/view',
            loader: ({ params }) => params,
            element: <ViewOperatorEntries />,
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
    errorElement: <ErrorElement />,
    children: [
      {
        path: '/approver',
        element: <ApproverWorkspaceLayout />,
        children: [
          {
            path: '',
            element: <ApproverDashboard />,
          },
          {
            path: 'approved',
            element: <ApproverApprovedTasks />,
          },
          {
            path: 'rejected',
            element: <ApproverRejectedTasks />,
          },
          {
            path: 'entries/:id/view',
            loader: ({ params }) => params,
            element: <ViewApproverEntries />,
          },
          {
            path: 'settings',
            element: <Settings />,
          },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute allowedRoles={['random']} />,
    errorElement: <ErrorElement />,
    children: [
      {
        path: '/custom',
        element: <RandomWorkspaceLayout />,
        children: [
          {
            path: '',
            element: <RandomDashboard />,
          },
          {
            path: 'approved',
            element: <RandomApprovedTasks />,
          },
          {
            path: 'rejected',
            element: <RandomRejectedTasks />,
          },
          {
            path: 'entries/:id/view',
            loader: ({ params }) => params,
            element: <ViewRandomEntries />,
          },
          {
            path: 'settings',
            element: <Settings />,
          },
        ],
      },
    ],
  },
]);
