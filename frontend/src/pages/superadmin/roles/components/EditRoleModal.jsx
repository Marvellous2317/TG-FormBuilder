import React, { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import { useUpdateRole } from '../../../../shared/hooks/superadmin/useRoles';
import Loader from '../../../../shared/components/Loader';
import useToast from '../../../../shared/hooks/useToast';

export default function EditRoleModal({
  isEditRoleModal,
  setIsEditRoleModal,
  roleToEdit,
  setRoleToEdit,
}) {
  const [roleName, setRoleName] = useState(roleToEdit?.roleName);
  const [roleDescription, setRoleDescription] = useState(
    roleToEdit?.description,
  );

  const { mutateAsync, isPending: isLoading } = useUpdateRole();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async () => {
    try {
      await mutateAsync({
        roleId: roleToEdit?.roleId,
        payload: { roleName, description: roleDescription },
      });

      showSuccess('Role updated successfully');
      setIsEditRoleModal(false);
      setRoleToEdit(null);
    } catch (error) {
      console.error('Error', error);
      showError('Unable to update role. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isEditRoleModal}
      onClose={() => {
        setIsEditRoleModal(false);
        setRoleToEdit(null);
      }}
      position="center"
      width="max-w-[460px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <div className="space-y-0.5">
          <p className="text-base font-semibold font-geist text-primary">
            Edit role
          </p>
          <p className="text-sm font-geist text-tertiary">
            Edit a role for users to be assigned
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
            onClick={() => {
              setIsEditRoleModal(false);
              setRoleToEdit(null);
            }}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-[10px] gap-2 bg-primary-200 disabled:bg-primary-200/70 px-4 py-2.5 text-sm flex items-center font-medium font-geist text-white"
            disabled={isLoading}
            onClick={handleSubmit}
          >
            Update
            {isLoading && <Loader size="border-white! h-4.5 w-4.5" />}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
