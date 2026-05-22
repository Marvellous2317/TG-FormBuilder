import React, { useState, useCallback } from 'react';
import Button from '../../../shared/components/Button';
import { IoAddOutline } from 'react-icons/io5';
import RoleList from './components/RoleList';
import CreateRoleModal from './components/CreateRoleModal';
import EditRoleModal from './components/EditRoleModal';
import { useRoles } from '../../../shared/hooks/superadmin/useRoles';
import DeleteRoleModal from './components/DeleteRoleModal';
import RestoreRoleModal from './components/RestoreRoleModal';

export default function RoleManagement() {
  const [isCreateRoleModal, setIsCreateRoleModal] = useState(false);
  const [isEditRoleModal, setIsEditRoleModal] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState(null);
  const [roleToRestore, setRoleToRestore] = useState(null);
  const [isDeleteRoleModalOpen, setIsDeleteRoleModalOpen] = useState(false);
  const [isRestoreRoleModalOpen, setIsRestoreRoleModalOpen] = useState(false);
  const [rolesPagination, setRolesPagination] = useState({
    page: 1,
    limit: 20,
    search: '',
    status: 'active',
    deleted: 'false',
  });

  const { data, isFetching } = useRoles(rolesPagination);

  const roles = data?.data?.roles;

  const handleSearch = useCallback((searchValue) => {
    setRolesPagination((prev) => ({ ...prev, search: searchValue, page: 1 }));
  }, []);

  const handleStatusChange = useCallback((status) => {
    setRolesPagination((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const handleDeletedChange = useCallback((deleted) => {
    setRolesPagination((prev) => ({ ...prev, deleted, page: 1 }));
  }, []);

  return (
    <div className="w-full min-h-screen max-h-screen">
      <header className="flex flex-col sm:flex-row gap-3 md:gap-0 w-full px-8 py-2.5 border-b border-secondary-200 md:items-center items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-primary text-xl font-medium font-geist">Roles</h1>
          <p className="text-sm text-tertiary font-geist">
            Create and manage roles and their descriptions
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsCreateRoleModal(true)}
          className="bg-primary-200 gap-1 p-2.5 rounded-[10px]"
        >
          <IoAddOutline className="text-white" size={14} />
          <p className="text-white font-geist font-medium text-sm">
            Add a role
          </p>
        </Button>
      </header>

      <section className="py-6 px-8 min-h-full relative">
        <RoleList
          setIsEditRoleModal={setIsEditRoleModal}
          setIsDeleteRoleModalOpen={setIsDeleteRoleModalOpen}
          roles={roles}
          pagination={data?.data?.pagination}
          setRoleToEdit={setRoleToEdit}
          setRoleToRestore={setRoleToRestore}
          handleSearch={handleSearch}
          isFetching={isFetching}
          setIsCreateRoleModal={setIsCreateRoleModal}
          handleStatusChange={handleStatusChange}
          handleDeletedChange={handleDeletedChange}
          setIsRestoreRoleModalOpen={setIsRestoreRoleModalOpen}
        />
      </section>

      <CreateRoleModal
        isCreateRoleModal={isCreateRoleModal}
        setIsCreateRoleModal={setIsCreateRoleModal}
      />

      <EditRoleModal
        key={`edit-${roleToEdit?.roleId}`}
        isEditRoleModal={isEditRoleModal}
        setIsEditRoleModal={setIsEditRoleModal}
        roleToEdit={roleToEdit}
        setRoleToEdit={setRoleToEdit}
      />

      <DeleteRoleModal
        key={`delete-${roleToEdit?.roleId}`}
        isDeleteRoleModalOpen={isDeleteRoleModalOpen}
        setIsDeleteRoleModalOpen={setIsDeleteRoleModalOpen}
        roleToDelete={roleToEdit}
        setRoleToDelete={setRoleToEdit}
      />

      <RestoreRoleModal
        key={`restore-${roleToRestore?.roleId}`}
        isRestoreRoleModalOpen={isRestoreRoleModalOpen}
        setIsRestoreModalOpen={setIsRestoreRoleModalOpen}
        roleToRestore={roleToRestore}
        setRoleToRestore={setRoleToRestore}
      />
    </div>
  );
}
