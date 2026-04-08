import React, { useState } from 'react';
import Button from '../../../shared/components/Button';
import { IoAddOutline } from 'react-icons/io5';
import RoleList from './components/RoleList';
import EmptyRoleList from './components/EmptyRoleList';

export default function RoleManagement() {
  const [isCreateRoleModal, setIsCreateRoleModal] = useState(false);
  const [isEditRoleModal, setIsEditRoleModal] = useState(false);

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
        {[1].length > 0 ? (
          <RoleList setIsEditRoleModal={setIsEditRoleModal} />
        ) : (
          <EmptyRoleList setIsCreateRoleModal={setIsCreateRoleModal} />
        )}
      </section>
    </div>
  );
}
