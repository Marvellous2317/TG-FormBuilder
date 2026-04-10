import React, { useState } from 'react';
import Button from '../../../shared/components/Button';
import { IoAddOutline } from 'react-icons/io5';
import RoleList from './components/RoleList';
import EmptyRoleList from './components/EmptyRoleList';
import CreateRoleModal from './components/CreateRoleModal';
import EditRoleModal from './components/EditRoleModal';
import { useRoles } from '../../../shared/hooks/superadmin/useRoles';
import Loader from '../../../shared/components/Loader';

export default function EntitiesManagement() {
  const [isCreateRoleModal, setIsCreateRoleModal] = useState(false);
  const [isEditRoleModal, setIsEditRoleModal] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState(null);

  const { data, isLoading } = useRoles();

  const roles = data?.data?.roles;

  return (
    <div className="w-full min-h-screen max-h-screen">
      <header className="flex flex-col sm:flex-row gap-3 md:gap-0 w-full px-8 py-2.5 border-b border-secondary-200 md:items-center items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-primary text-xl font-medium font-geist">
            Entities
          </h1>
          <p className="text-sm text-tertiary font-geist">
            You have 6 onboarded entities
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsCreateRoleModal(true)}
          className="bg-primary-200 gap-1 p-2.5 rounded-[10px]"
        >
          <IoAddOutline className="text-white" size={14} />
          <p className="text-white font-geist font-medium text-sm">
            Onboard entity
          </p>
        </Button>
      </header>

      {isLoading ? (
        <Loader size="h-12 w-12 !border-primary-200 mt-20" />
      ) : (
        <section className="py-6 px-8 min-h-full relative">
          {roles?.length > 0 ? (
            <RoleList
              setIsEditRoleModal={setIsEditRoleModal}
              roles={roles}
              pagination={data.data.pagination}
              setRoleToEdit={setRoleToEdit}
            />
          ) : (
            <EmptyRoleList setIsCreateRoleModal={setIsCreateRoleModal} />
          )}
        </section>
      )}

      <CreateRoleModal
        isCreateRoleModal={isCreateRoleModal}
        setIsCreateRoleModal={setIsCreateRoleModal}
      />

      <EditRoleModal
        key={roleToEdit?.roleName}
        isEditRoleModal={isEditRoleModal}
        setIsEditRoleModal={setIsEditRoleModal}
        roleToEdit={roleToEdit}
        setRoleToEdit={setRoleToEdit}
      />
    </div>
  );
}
