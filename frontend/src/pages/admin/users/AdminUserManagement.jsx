import React, { useState, useCallback } from 'react';
import Button from '../../../shared/components/Button';
import { IoAddOutline } from 'react-icons/io5';
import AdminCard from '../dashboard/components/AdminCard';
import Icons from '../../../assets/icons';
import {
  useFetchUsers,
  useUserStatistics,
} from '../../../shared/hooks/superadmin/useSuperAdminUser';
import AdminUserList from '../../superadmin/users/components/AdminUserList';
import CreateAdminUserModal from '../../superadmin/users/components/CreateAdminUserModal';
import DeleteUserModal from '../../superadmin/users/components/DeleteUserModal';
import RestoreUserModal from '../../superadmin/users/components/RestoreUserModal';
import AssignApproverModal from '../../superadmin/users/components/AssignApproverModal';
import UnassignApproverModal from '../../superadmin/users/components/UnassignApproverModal';
import EditAdminUserModal from '../../superadmin/users/components/EditAdminUserModal';

export default function AdminUserManagement() {
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isRestoreUserModalOpen, setIsRestoreUserModalOpen] = useState(false);
  const [userToRestore, setUserToRestore] = useState(null);
  const [isAssignApproverModalOpen, setIsAssignApproverModalOpen] =
    useState(false);
  const [isUnassignApproverModalOpen, setIsUnassignApproverModalOpen] =
    useState(false);

  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 20,
    search: '',
    status: 'active',
    deleted: 'false',
  });

  const { data: users, isFetching } = useFetchUsers(usersPagination);
  const { data: statistics, isPending: isLoadingUserStatistics } =
    useUserStatistics();

  const userStatistics = statistics?.data;
  const usersData = users?.data?.users;
  const pagination = users?.data?.pagination;

  const handleSearch = useCallback((searchValue) => {
    setUsersPagination((prev) => ({ ...prev, search: searchValue, page: 1 }));
  }, []);

  const handleStatusChange = useCallback((status) => {
    setUsersPagination((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const handleDeletedChange = useCallback((deleted) => {
    setUsersPagination((prev) => ({ ...prev, deleted, page: 1 }));
  }, []);

  const handlePagination = useCallback(({ page, pageSize }) => {
    setUsersPagination((prev) => ({
      ...prev,
      page: Number(page) || 1,
      limit: Number(pageSize) || 20,
    }));
  }, []);

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
        <div className="flex flex-col md:flex-row items-center w-full gap-9">
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

      <section className="py-6 px-8 min-h-full relative">
        <AdminUserList
          setIsEditUserModalOpen={setIsEditUserModalOpen}
          setUserToDelete={setUserToDelete}
          setUserToRestore={setUserToRestore}
          users={usersData}
          pagination={pagination}
          handlePageChange={handlePagination}
          setUserToEdit={setUserToEdit}
          setIsDeleteUserModalOpen={setIsDeleteUserModalOpen}
          setIsRestoreUserModalOpen={setIsRestoreUserModalOpen}
          setIsAssignApproverModalOpen={setIsAssignApproverModalOpen}
          setIsUnassignApproverModalOpen={setIsUnassignApproverModalOpen}
          isFetching={isFetching}
          handleSearch={handleSearch}
          handleStatusChange={handleStatusChange}
          handleDeletedChange={handleDeletedChange}
          setIsCreateUserModalOpen={setIsCreateUserModalOpen}
          fromAdmin
        />
      </section>

      <CreateAdminUserModal
        isCreateUserModalOpen={isCreateUserModalOpen}
        setIsCreateUserModalOpen={setIsCreateUserModalOpen}
        fromAdmin
      />

      <DeleteUserModal
        key={`delete-${userToDelete?.userId}`}
        isDeleteUserModalOpen={isDeleteUserModalOpen}
        setIsDeleteUserModalOpen={setIsDeleteUserModalOpen}
        userToDelete={userToDelete}
        setUserToDelete={setUserToDelete}
      />

      <RestoreUserModal
        key={`restore-${userToRestore?.userId}`}
        isRestoreUserModalOpen={isRestoreUserModalOpen}
        setIsRestoreUserModalOpen={setIsRestoreUserModalOpen}
        userToRestore={userToRestore}
        setUserToRestore={setUserToRestore}
      />

      <AssignApproverModal
        key={`assign-${userToEdit?.userId}`}
        isAssignApproverModalOpen={isAssignApproverModalOpen}
        setIsAssignApproverModalOpen={setIsAssignApproverModalOpen}
        userToEdit={userToEdit}
      />

      <UnassignApproverModal
        key={`unassign-${userToEdit?.userId}`}
        isUnassignApproverModalOpen={isUnassignApproverModalOpen}
        setIsUnassignApproverModalOpen={setIsUnassignApproverModalOpen}
        userToEdit={userToEdit}
        users={usersData}
        isFetching={isFetching}
      />

      <EditAdminUserModal
        key={`edit-${userToEdit?.userId}`}
        isEditUserModalOpen={isEditUserModalOpen}
        setIsEditUserModalOpen={setIsEditUserModalOpen}
        userToEdit={userToEdit}
        setUserToEdit={setUserToEdit}
        fromAdmin
      />
    </div>
  );
}
