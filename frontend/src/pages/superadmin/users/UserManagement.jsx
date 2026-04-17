import React, { useState } from 'react';
import Button from '../../../shared/components/Button';
import { IoAddOutline } from 'react-icons/io5';
import UserList from './components/UserList';
import Icons from '../../../assets/icons';
import InviteUsersModal from './components/InviteUsersModal';
import EditUsersModal from './components/EditUsersModal';

import AdminEmptyUsersList from '../dashboard/components/AdminEmptyUsersList';
import AdminUsersList from '../dashboard/components/AdminDashboardList';
import AdminCard from '../../admin/dashboard/components/AdminCard';
import AdminCreateUsersModal from '../dashboard/components/AdminCreateUsersModal';
import AdminEditUsersModal from '../dashboard/components/AdminEditUsersModal';
import {
  useFetchUsers,
  useUserStatistics,
} from '../../../shared/hooks/superadmin/useSuperAdminUser';

export default function UserManagement() {
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);

  // const { data, isPending: isLoading } = useFetchUsers();
  const { data: statistics, isPending: isLoading } = useUserStatistics();

  const userStatistics = statistics?.data;

  return (
    <div className="w-full min-h-screen max-h-screen">
      <header className="flex flex-col sm:flex-row gap-3 md:gap-0 w-full px-8 py-2.5 border-b border-secondary-200 md:items-center items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-primary text-xl font-medium font-geist">Users</h1>
          <p className="text-sm text-tertiary font-geist">
            Invite and manage user roles and logbook access for your entity
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsCreateUserModalOpen(true)}
          className="bg-primary-200 gap-1 p-2.5 rounded-[10px]"
        >
          <IoAddOutline className="text-white" size={14} />
          <p className="text-white font-geist font-medium text-sm">
            Add a user
          </p>
        </Button>
      </header>

      <section className="py-6 px-8">
        <div className="flex flex-col md:flex-row items-center w-full gap-9 ">
          <AdminCard
            icon={Icons.totalUsers}
            title="Total users"
            count={userStatistics?.totalUsers || 0}
            loading={isLoading}
          />
          <AdminCard
            icon={Icons.activeUsers}
            title="Active users"
            count={userStatistics?.activeUsers || 0}
            loading={isLoading}
          />
          <AdminCard
            icon={Icons.inactiveUsers}
            title="Inactive users"
            count={userStatistics?.suspendedUsers || 0}
            loading={isLoading}
          />
          <AdminCard
            icon={Icons.inactiveUsers}
            title="Total roles"
            count={userStatistics?.totalRoles || 0}
            loading={isLoading}
          />
        </div>
      </section>

      {/* <section className="py-6 px-8 min-h-full relative">
        {[1].length > 0 ? (
          <AdminUsersList setIsEditUserModalOpen={setIsEditUserModalOpen} />
        ) : (
          <AdminEmptyUsersList
            setIsCreateUserModalOpen={setIsCreateUserModalOpen}
          />
        )}
      </section> */}

      {/* <AdminCreateUsersModal
        isCreateUserModalOpen={isCreateUserModalOpen}
        setIsCreateUserModalOpen={setIsCreateUserModalOpen}
      />

      <AdminEditUsersModal
        isEditUserModalOpen={isEditUserModalOpen}
        setIsEditUserModalOpen={setIsEditUserModalOpen}
      /> */}
    </div>
  );
}
