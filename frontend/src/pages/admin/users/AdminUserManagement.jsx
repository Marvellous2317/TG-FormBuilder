import React, { useState } from 'react';
import Button from '../../../shared/components/Button';
import { IoAddOutline } from 'react-icons/io5';
import AdminCard from '../dashboard/components/AdminCard';
import UserList from './components/UserList';
import EmptyUsersList from './components/EmptyUsersList';
import Icons from '../../../assets/icons';
import InviteUsersModal from './components/InviteUsersModal';
import EditUsersModal from './components/EditUsersModal';
import DeactivateUserModal from './components/DeactivateUserModal';
import {
  useFetchUsers,
  useUserStatistics,
} from '../../../shared/hooks/superadmin/useSuperAdminUser';
import Loader from '../../../shared/components/Loader';
import AdminUserList from '../../superadmin/users/components/AdminUserList';
import EmptyAdminUserList from '../../superadmin/users/components/EmptyAdminUserList';
import CreateAdminUserModal from '../../superadmin/users/components/CreateAdminUserModal';
import DeleteUserModal from '../../superadmin/users/components/DeleteUserModal';
import AssignApproverModal from '../../superadmin/users/components/AssignApproverModal';
import UnassignApproverModal from '../../superadmin/users/components/UnassignApproverModal';
import EditAdminUserModal from '../../superadmin/users/components/EditAdminUserModal';

export default function AdminUserManagement() {
  // const [isDeactivateUserModalOpen, setIsDeactivateUserModalOpen] =
  //   useState(false);

  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isAssignApproverModalOpen, setIsAssignApproverModalOpen] =
    useState(false);

  const [isUnassignApproverModalOpen, setIsUnassignApproverModalOpen] =
    useState(false);

  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 20,
  });

  const { data: users, isPending: isLoadingUsers } =
    useFetchUsers(usersPagination);
  const { data: statistics, isPending: isLoadingUserStatistics } =
    useUserStatistics();

  const userStatistics = statistics?.data;

  const usersData = users?.data?.users;
  const pagination = users?.data?.pagination;

  const handlePagination = ({ page, pageSize }) => {
    setUsersPagination({
      page: Number(page) || 1,
      limit: Number(pageSize) || 20,
    });
  };

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
            Invite users
          </p>
        </Button>
      </header>

      <section className="py-6 px-8">
        <div className="flex flex-col md:flex-row items-center w-full gap-9 ">
          <AdminCard
            icon={Icons.totalUsers}
            title="Total users"
            count={userStatistics?.totalUsers || 0}
            loading={isLoadingUserStatistics}
          />
          <AdminCard
            icon={Icons.activeUsers}
            title="Active users"
            count={userStatistics?.activeUsers || 0}
            loading={isLoadingUserStatistics}
          />
          <AdminCard
            icon={Icons.inactiveUsers}
            title="Inactive users"
            count={userStatistics?.suspendedUsers || 0}
            loading={isLoadingUserStatistics}
          />
        </div>
      </section>

      {isLoadingUsers ? (
        <Loader size="h-12 w-12 !border-primary-200 mt-20" />
      ) : (
        <section className="py-6 px-8 min-h-full relative">
          {usersData?.length > 0 ? (
            <AdminUserList
              setIsEditUserModalOpen={setIsEditUserModalOpen}
              setUserToDelete={setUserToDelete}
              users={usersData}
              pagination={pagination}
              handlePageChange={handlePagination}
              setUserToEdit={setUserToEdit}
              setIsDeleteUserModalOpen={setIsDeleteUserModalOpen}
              setIsAssignApproverModalOpen={setIsAssignApproverModalOpen}
              userToEdit={userToEdit}
              setIsUnassignApproverModalOpen={setIsUnassignApproverModalOpen}
            />
          ) : (
            <EmptyAdminUserList
              setIsCreateUserModalOpen={setIsCreateUserModalOpen}
            />
          )}
        </section>
      )}

      <CreateAdminUserModal
        isCreateUserModalOpen={isCreateUserModalOpen}
        setIsCreateUserModalOpen={setIsCreateUserModalOpen}
      />

      <DeleteUserModal
        isDeleteUserModalOpen={isDeleteUserModalOpen}
        setIsDeleteUserModalOpen={setIsDeleteUserModalOpen}
        userToDelete={userToDelete}
        setUserToDelete={setUserToDelete}
      />

      <AssignApproverModal
        isAssignApproverModalOpen={isAssignApproverModalOpen}
        setIsAssignApproverModalOpen={setIsAssignApproverModalOpen}
        userToEdit={userToEdit}
        key={userToEdit?.userId}
      />

      <UnassignApproverModal
        isUnassignApproverModalOpen={isUnassignApproverModalOpen}
        setIsUnassignApproverModalOpen={setIsUnassignApproverModalOpen}
        userToEdit={userToEdit}
        users={usersData}
        isLoadingUsers={isLoadingUsers}
        key={users?.userId}
      />

      <EditAdminUserModal
        isEditUserModalOpen={isEditUserModalOpen}
        setIsEditUserModalOpen={setIsEditUserModalOpen}
        userToEdit={userToEdit}
        setUserToEdit={setUserToEdit}
        key={users?.userId}
        fromAdmin
      />

      {/* <section className="py-6 px-8 min-h-full relative">
        {[1].length > 0 ? (
          <UserList
            setIsEditUserModalOpen={setIsEditUserModalOpen}
            setIsDeactivateUserModalOpen={setIsDeactivateUserModalOpen}
          />
        ) : (
          <EmptyUsersList setIsInviteModalOpen={setIsInviteModalOpen} />
        )}
      </section>

      <InviteUsersModal
        isInviteModalOpen={isInviteModalOpen}
        setIsInviteModalOpen={setIsInviteModalOpen}
      />

      <EditUsersModal
        isEditUserModalOpen={isEditUserModalOpen}
        setIsEditUserModalOpen={setIsEditUserModalOpen}
      />

      <DeactivateUserModal
        isDeactivateUserModalOpen={isDeactivateUserModalOpen}
        setIsDeactivateUserModalOpen={setIsDeactivateUserModalOpen}
      /> */}
    </div>
  );
}
