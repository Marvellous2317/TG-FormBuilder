import React, { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import {
  useCreateRoles,
  useRoles,
} from '../../../../shared/hooks/superadmin/useRoles';
import useToast from '../../../../shared/hooks/useToast';
import Loader from '../../../../shared/components/Loader';

export default function CreateRoleModal({
  isCreateRoleModal,
  setIsCreateRoleModal,
}) {
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');

  const { mutateAsync, isPending: isLoading } = useCreateRoles();

  const { showSuccess, showError } = useToast();

  const handleSubmit = async () => {
    if (!roleName) {
      showError('Role name is required');
      return;
    }

    if (!roleDescription) {
      showError('Role description is required');
      return;
    }

    try {
      await mutateAsync({ roleName, description: roleDescription });

      showSuccess('Role created successfully');
      setIsCreateRoleModal(false);
    } catch (err) {
      console.error('Error', err);
      showError('Unable to create role. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isCreateRoleModal}
      onClose={() => setIsCreateRoleModal(false)}
      position="center"
      width="max-w-[460px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <div className="space-y-0.5">
          <p className="text-base font-semibold font-geist text-primary">
            Create role
          </p>
          <p className="text-sm font-geist text-tertiary">
            Create a role for users to be assigned
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-4 mt-7">
          <InputField
            label="Role name"
            id="roleName"
            className=""
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />

          <InputField
            label="Role description"
            id="roleDescription"
            className=""
            value={roleDescription}
            onChange={(e) => setRoleDescription(e.target.value)}
          />
        </div>

        <div className="flex items-center mt-6 justify-end gap-3">
          <Button
            type="button"
            onClick={() => setIsCreateRoleModal(false)}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-[10px] bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white gap-2"
            onClick={() => handleSubmit()}
          >
            Continue
            {isLoading && <Loader size="border-white! h-4.5 w-4.5" />}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
