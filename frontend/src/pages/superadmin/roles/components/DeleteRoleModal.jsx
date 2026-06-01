import React from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import Icons from '../../../../assets/icons';
import { useDeleteRole } from '../../../../shared/hooks/superadmin/useRoles';
import useToast from '../../../../shared/hooks/useToast';
import Loader from '../../../../shared/components/Loader';

export default function DeactivateUserModal({
  isDeleteRoleModalOpen,
  setIsDeleteRoleModalOpen,
  roleToDelete,
  setRoleToDelete,
}) {
  const { mutateAsync: deleteRole, isPending: isLoading } = useDeleteRole();
  const { showSuccess } = useToast();

  const handleSubmit = async () => {
    try {
      await deleteRole({ roleId: roleToDelete?.roleId });
      showSuccess('Role deleted successfully');
      setIsDeleteRoleModalOpen(false);
      setRoleToDelete(null);
    } catch (error) {
      console.error('Error', error);
    }
  };

  return (
    <Modal
      isOpen={isDeleteRoleModalOpen}
      onClose={() => setIsDeleteRoleModalOpen(false)}
      position="center"
      width="max-w-[386px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <div className="mt-9 flex justify-center items-center mb-4">
          <div className="flex items-center justify-center w-14 h-14 bg-tertiary-600 rounded-xl">
            <img
              src={Icons.deactivateUser}
              alt="delete role"
              className="w-4.5 object-contain"
            />
          </div>
        </div>
        <div className="space-y-0.5 w-full text-center flex items-center flex-col">
          <p className="text-base font-semibold font-geist text-primary">
            Delete role
          </p>
          <p className="text-sm font-geist w-3/4 text-tertiary">
            Are you sure you want to delete this role?
          </p>
        </div>

        <div className="flex items-center mt-6 justify-end gap-3">
          <Button
            type="button"
            onClick={() => setIsDeleteRoleModalOpen(false)}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-[10px] flex items-center gap-2 bg-tertiary-500 px-4 py-2.5 text-sm font-medium font-geist text-white"
            onClick={() => handleSubmit()}
          >
            Delete
            {isLoading && <Loader size="border-white! h-4.5 w-4.5" />}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
